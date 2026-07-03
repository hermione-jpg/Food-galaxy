import { motion } from "framer-motion";

const CARD_BG = "#0D0F22";
const TEXT = "#EDEBF5";

function hexToRgba(hex, a) {
  const h = (hex || "#888888").replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

// A cousin "moon" that revolves around the main card at a fixed radius,
// counter-rotating so its own content stays upright while it orbits.
function CousinMoon({ cousin, mood, radius, duration, startAngle, size }) {
  return (
    <motion.div
      style={{ position: "absolute", left: 0, top: 0, width: 0, height: 0 }}
      animate={{ rotate: [startAngle, startAngle + 360] }}
      transition={{ duration, repeat: Infinity, ease: "linear" }}
    >
      <motion.div
        style={{ position: "absolute", left: radius, top: 0, width: 0, height: 0 }}
        animate={{ rotate: [-startAngle, -(startAngle + 360)] }}
        transition={{ duration, repeat: Infinity, ease: "linear" }}
      >
        <div
          title={`${cousin.name} — ${cousin.region}`}
          style={{
            position: "absolute",
            transform: "translate(-50%,-50%)",
            width: size,
            height: size,
            borderRadius: "50%",
            background: `radial-gradient(circle at 32% 28%, ${hexToRgba(mood, 0.4)}, ${CARD_BG} 75%)`,
            border: `1px solid ${hexToRgba(mood, 0.55)}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: 3,
            boxSizing: "border-box",
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: Math.max(6, size * 0.10),
            lineHeight: 1.15,
            color: TEXT,
            boxShadow: `0 0 10px ${hexToRgba(mood, 0.25)}`,
            userSelect: "none",
          }}
        >
          {cousin.name}
        </div>
      </motion.div>
    </motion.div>
  );
}

// A full cluster: one main dish "planet" plus its 3 cousin "moons",
// all drifting together as a unit across the galaxy.
export default function DishCluster({
  dish,
  x,
  y,
  mainSize,
  cousinSize,
  driftDuration,
  driftRange,
  seed,
  zIndex,
  onSelect,
}) {
  const cousins = dish.similar || [];

  return (
    <motion.div
      style={{ position: "absolute", left: x, top: y, width: 0, height: 0, zIndex }}
      animate={{
        x: [0, driftRange * 0.7, -driftRange * 0.5, driftRange * 0.3, 0],
        y: [0, -driftRange * 0.6, driftRange * 0.8, -driftRange * 0.3, 0],
      }}
      transition={{ duration: driftDuration, repeat: Infinity, ease: "easeInOut" }}
    >
      {cousins.map((c, i) => (
        <CousinMoon
          key={i}
          cousin={c}
          mood={dish.mood}
          radius={mainSize * 0.7 + i * (mainSize * 0.20)}
          duration={13 + i * 5 + seed * 6}
          startAngle={i * 120 + seed * 90}
          size={cousinSize}
        />
      ))}

      <motion.button
        onClick={() => onSelect(dish)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: "absolute",
          transform: "translate(-50%,-50%)",
          width: mainSize,
          height: mainSize,
          borderRadius: "50%",
          border: `1.5px solid ${hexToRgba(dish.mood, 0.7)}`,
          background: `radial-gradient(circle at 32% 26%, ${hexToRgba(dish.mood, 0.45)}, ${CARD_BG} 72%)`,
          boxShadow: `0 0 30px ${hexToRgba(dish.mood, 0.32)}, inset 0 0 24px ${hexToRgba(dish.mood, 0.15)}`,
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: TEXT,
          padding: 6,
          boxSizing: "border-box",
        }}
      >
        <div style={{ fontSize: mainSize * 0.34 }}>{dish.emoji}</div>
        <div
          style={{
            fontFamily: "'Fraunces', serif",
            fontStyle: "italic",
            fontSize: Math.max(10, mainSize * 0.115),
            marginTop: 2,
            whiteSpace: "nowrap",
            maxWidth: mainSize * 0.9,
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {dish.name}
        </div>
      </motion.button>
    </motion.div>
  );
}
