import { useEffect, useMemo, useRef, useState } from "react";
import DishCluster from "./FoodOrbit.jsx";

function useViewportSize() {
  const [size, setSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1200,
    height: typeof window !== "undefined" ? window.innerHeight : 800,
  });
  useEffect(() => {
    let raf;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() =>
        setSize({ width: window.innerWidth, height: window.innerHeight })
      );
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      cancelAnimationFrame(raf);
    };
  }, []);
  return size;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e) => setReduced(e.matches);
    mq.addEventListener ? mq.addEventListener("change", onChange) : mq.addListener(onChange);
    return () => {
      mq.removeEventListener ? mq.removeEventListener("change", onChange) : mq.removeListener(onChange);
    };
  }, []);
  return reduced;
}

// small deterministic PRNG so a given dish always lands in roughly
// the same spot / drifts the same way between re-renders
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashId(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return h;
}

// responsive sizing tiers, in "world" pixels at zoom level 1
function sizesForWidth(width) {
  if (width < 420) return { mainSize: 76, cousinSize: 28 };
  if (width < 640) return { mainSize: 92, cousinSize: 34 };
  if (width < 900) return { mainSize: 110, cousinSize: 40 };
  if (width < 1200) return { mainSize: 126, cousinSize: 46 };
  return { mainSize: 142, cousinSize: 54 };
}

const MIN_SCALE = 0.35;
const MAX_SCALE = 2.75;
const DRAG_THRESHOLD = 4;

function clampScale(s) {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, s));
}

export default function GalaxyView({ dishes, onSelect }) {
  const { width, height } = useViewportSize();
  const reducedMotion = usePrefersReducedMotion();
  const isSmall = width < 640;

  const { mainSize, cousinSize } = sizesForWidth(width);
  const margin = mainSize * 1.5;

  const containerRef = useRef(null);
  const [camera, setCamera] = useState({ x: 0, y: 0, scale: 1 });
  const cameraRef = useRef(camera);
  cameraRef.current = camera;

  const pointers = useRef(new Map());
  const gesture = useRef({ mode: null, startCam: { x: 0, y: 0, scale: 1 }, startMid: { x: 0, y: 0 }, startDist: 0, moved: false });
  const draggedFlagRef = useRef(false);
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 4500);
    return () => clearTimeout(t);
  }, []);

  // reset camera when the underlying viewport changes drastically (e.g. rotate)
  useEffect(() => {
    setCamera({ x: 0, y: 0, scale: 1 });
  }, [width < 640, height < 480]); // eslint-disable-line react-hooks/exhaustive-deps

  const positions = useMemo(() => {
    const count = dishes.length;
    if (count === 0) return [];

    const usableW = Math.max(width - margin * 2, 240);
    const usableH = Math.max(height - margin * 2, 240);
    const cols = Math.max(1, Math.round(Math.sqrt(count * (usableW / usableH))));
    const rows = Math.ceil(count / cols);
    const cellW = usableW / cols;
    const cellH = usableH / rows;

    const slots = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) slots.push({ col: c, row: r });
    }

    return dishes.map((d, i) => {
      const rand = mulberry32(hashId(d.id) + i * 7919);
      const slot = slots[i % slots.length];
      const jitterX = (rand() - 0.5) * cellW * 0.75;
      const jitterY = (rand() - 0.5) * cellH * 0.75;
      const x = margin + cellW * (slot.col + 0.5) + jitterX;
      const y = margin + cellH * (slot.row + 0.5) + jitterY;
      const driftDuration = 9 + rand() * 8;
      const driftRange = 22 + rand() * 24;
      const seed = rand();
      const depth = 0.72 + rand() * 0.5;
      return { dish: d, x, y, driftDuration, driftRange, seed, depth };
    });
  }, [dishes, width, height, margin]);

  function getMidAndDist(pts) {
    const arr = Array.from(pts.values());
    if (arr.length === 1) return { mid: arr[0], dist: 0 };
    const [a, b] = arr;
    return { mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, dist: Math.hypot(a.x - b.x, a.y - b.y) };
  }

  function zoomAtPoint(clientX, clientY, factor) {
    setCamera((prev) => {
      const newScale = clampScale(prev.scale * factor);
      const rect = containerRef.current.getBoundingClientRect();
      const px = clientX - rect.left;
      const py = clientY - rect.top;
      const worldX = (px - prev.x) / prev.scale;
      const worldY = (py - prev.y) / prev.scale;
      return { x: px - worldX * newScale, y: py - worldY * newScale, scale: newScale };
    });
  }

  const handlePointerDown = (e) => {
    setShowHint(false);
    containerRef.current.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const { mid, dist } = getMidAndDist(pointers.current);
    gesture.current = {
      mode: pointers.current.size === 1 ? "pan" : "pinch",
      startCam: { ...cameraRef.current },
      startMid: mid,
      startDist: dist,
      moved: false,
    };
  };

  const handlePointerMove = (e) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const { mid, dist } = getMidAndDist(pointers.current);
    const dx = mid.x - gesture.current.startMid.x;
    const dy = mid.y - gesture.current.startMid.y;
    if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) gesture.current.moved = true;

    if (gesture.current.mode === "pan") {
      setCamera({
        ...gesture.current.startCam,
        x: gesture.current.startCam.x + dx,
        y: gesture.current.startCam.y + dy,
      });
    } else if (gesture.current.mode === "pinch" && gesture.current.startDist > 0) {
      const scaleFactor = dist / gesture.current.startDist;
      const newScale = clampScale(gesture.current.startCam.scale * scaleFactor);
      const rect = containerRef.current.getBoundingClientRect();
      const startPx = gesture.current.startMid.x - rect.left;
      const startPy = gesture.current.startMid.y - rect.top;
      const worldX = (startPx - gesture.current.startCam.x) / gesture.current.startCam.scale;
      const worldY = (startPy - gesture.current.startCam.y) / gesture.current.startCam.scale;
      const px = mid.x - rect.left;
      const py = mid.y - rect.top;
      setCamera({ x: px - worldX * newScale, y: py - worldY * newScale, scale: newScale });
    }
  };

  const handlePointerUp = (e) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size === 1) {
      const [remaining] = pointers.current.values();
      gesture.current = { mode: "pan", startCam: { ...cameraRef.current }, startMid: remaining, startDist: 0, moved: gesture.current.moved };
    } else if (pointers.current.size === 0) {
      draggedFlagRef.current = gesture.current.moved;
      gesture.current.mode = null;
    }
  };

  const handleSelect = (dish) => {
    if (draggedFlagRef.current) {
      draggedFlagRef.current = false;
      return;
    }
    onSelect(dish);
  };

  const resetCamera = () => setCamera({ x: 0, y: 0, scale: 1 });
  const zoomButton = (factor) => zoomAtPoint(width / 2, height / 2, factor);

  // native wheel + keyboard listeners (need non-passive wheel to preventDefault reliably)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e) => {
      e.preventDefault();
      setShowHint(false);
      const factor = Math.pow(1.0018, -e.deltaY);
      zoomAtPoint(e.clientX, e.clientY, factor);
    };

    const onKeyDown = (e) => {
      if (e.key === "+" || e.key === "=") zoomButton(1.2);
      else if (e.key === "-" || e.key === "_") zoomButton(1 / 1.2);
      else if (e.key === "0") resetCamera();
    };

    const onDoubleClick = (e) => {
      resetCamera();
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    el.addEventListener("dblclick", onDoubleClick);
    return () => {
      el.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
      el.removeEventListener("dblclick", onDoubleClick);
    };
  }, [width, height]); // eslint-disable-line react-hooks/exhaustive-deps

  const zoomPct = Math.round(camera.scale * 100);

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1,
        overflow: "hidden",
        touchAction: "none",
        userSelect: "none",
        cursor: "grab",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.scale})`,
          transformOrigin: "0 0",
          willChange: "transform",
        }}
      >
        {positions.length === 0 && (
          <div
            style={{
              position: "absolute",
              left: width / 2,
              top: height / 2,
              transform: `translate(-50%,-50%) scale(${1 / camera.scale})`,
              color: "#8B8FB0",
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 13,
              whiteSpace: "nowrap",
              textAlign: "center",
            }}
          >
            no dishes match this filter — try another cuisine
          </div>
        )}
        {positions.map(({ dish, x, y, driftDuration, driftRange, seed, depth }, i) => (
          <div
            key={dish.id}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              transform: `scale(${depth})`,
              transformOrigin: `${x}px ${y}px`,
            }}
          >
            <DishCluster
              dish={dish}
              x={x}
              y={y}
              mainSize={mainSize}
              cousinSize={cousinSize}
              driftDuration={driftDuration}
              driftRange={driftRange}
              seed={seed}
              zIndex={Math.round(depth * 100) + i}
              onSelect={handleSelect}
              reducedMotion={reducedMotion}
            />
          </div>
        ))}
      </div>

      {/* zoom controls */}
      <div
        style={{
          position: "fixed",
          left: 18,
          bottom: 26,
          zIndex: 5,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
        }}
      >
        <button
          onClick={() => zoomButton(1.25)}
          aria-label="Zoom in"
          style={ctrlBtnStyle}
        >
          +
        </button>
        <div
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 10,
            color: "#8B8FB0",
            background: "rgba(13,15,34,0.7)",
            borderRadius: 8,
            padding: "2px 6px",
          }}
        >
          {zoomPct}%
        </div>
        <button
          onClick={() => zoomButton(1 / 1.25)}
          aria-label="Zoom out"
          style={ctrlBtnStyle}
        >
          −
        </button>
        <button
          onClick={resetCamera}
          aria-label="Reset view"
          style={{ ...ctrlBtnStyle, fontSize: 13, marginTop: 4 }}
          title="reset view"
        >
          ⟳
        </button>
      </div>

      {showHint && (
        <div
          style={{
            position: "fixed",
            bottom: isSmall ? 96 : 26,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 5,
            background: "rgba(13,15,34,0.75)",
            border: "1px solid #22254A",
            borderRadius: 20,
            padding: "7px 16px",
            color: "#8B8FB0",
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 11,
            textAlign: "center",
            backdropFilter: "blur(6px)",
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          {isSmall ? "pinch to zoom · drag to explore" : "scroll to zoom · drag to pan · double-click to reset"}
        </div>
      )}
    </div>
  );
}

const ctrlBtnStyle = {
  width: 36,
  height: 36,
  borderRadius: "50%",
  border: "1px solid #8B8FB0",
  background: "rgba(13,15,34,0.75)",
  color: "#EDEBF5",
  cursor: "pointer",
  fontSize: 18,
  lineHeight: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backdropFilter: "blur(6px)",
};
