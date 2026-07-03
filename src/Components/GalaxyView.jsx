import { useEffect, useMemo, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
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
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, []);
  return size;
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

export default function GalaxyView({ dishes, onSelect }) {
  const { width, height } = useViewportSize();
  const isSmall = width < 640;

const mainSize = 100;
const cousinSize = 80;
const margin = 300

  // subtle parallax layer, driven by pointer position across the whole screen
  const mvX = useMotionValue(0.5);
  const mvY = useMotionValue(0.5);
  const springX = useSpring(mvX, { stiffness: 35, damping: 20 });
  const springY = useSpring(mvY, { stiffness: 35, damping: 20 });
  const parallaxX = useTransform(springX, [0, 1], [26, -26]);
  const parallaxY = useTransform(springY, [0, 1], [20, -20]);

  const handlePointerMove = (e) => {
    mvX.set(e.clientX / window.innerWidth);
    mvY.set(e.clientY / window.innerHeight);
  };

  const positions = useMemo(() => {
    const count = dishes.length;
    if (count === 0) return [];

    const usableW = 1000;
    const usableH = 300;
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
      const depth = 0.72 + rand() * 0.5; // scale variance for a sense of depth
      return { dish: d, x, y, driftDuration, driftRange, seed, depth };
    });
  }, [dishes, width, height, margin]);

  return (
    <div
      onPointerMove={handlePointerMove}
      style={{ position: "fixed", inset: 0, zIndex: 1, overflow: "hidden" }}
    >
      <motion.div style={{ position: "absolute", inset: 0, x: parallaxX, y: parallaxY }}>
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
              onSelect={onSelect}
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
}
