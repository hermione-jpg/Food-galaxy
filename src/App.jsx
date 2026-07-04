import { useState, useEffect, useMemo } from "react";
import GalaxyView from "./Components/GalaxyView.jsx";

const FONT_IMPORT = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;1,9..144,500&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
*::-webkit-scrollbar { display: none; }
* { -ms-overflow-style: none; }
`;

const BG = "#05060F";
const CARD_BG = "#0D0F22";
const TEXT = "#EDEBF5";
const DUST = "#8B8FB0";
const LINE = "#22254A";
const STORAGE_KEY = "food-galaxy-dishes";

function slugify(str) {
  return (str || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const SEED = [
  {
    id: "samosa",
    name: "Samosa",
    cuisine: "South Asia",
    category: "dish",
    emoji: "🥟",
    mood: "#E8A24B",
    ingredients: ["potato", "peas", "cumin", "wheat flour", "ghee"],
    lineage:
      "Descended from the Central Asian 'sambosa', carried into South Asia by traders around the 13th century, where the filling shifted from meat to spiced potato.",
    similar: [
      { name: "Empanada", region: "Latin America / Iberia", note: "Same fold-and-fry logic, different filling tradition." },
      { name: "Gyoza", region: "East Asia", note: "A pleated dumpling cousin, steamed or pan-fried instead." },
      { name: "Börek", region: "Turkey / Balkans", note: "Shares the stuffed-pastry ancestry via Persian and Ottoman trade routes." },
    ],
  },
  {
    id: "biryani",
    name: "Biryani",
    cuisine: "South Asia",
    category: "dish",
    emoji: "🍛",
    mood: "#C77B3A",
    ingredients: ["basmati rice", "meat or vegetables", "saffron", "fried onions", "whole spices"],
    lineage:
      "Rooted in Persian pilaf traditions, layered and regionalized across the subcontinent into dozens of distinct styles — Hyderabadi, Lucknowi, Kolkata, Malabar.",
    similar: [
      { name: "Paella", region: "Spain", note: "Another rice dish built around layered flavor and saffron." },
      { name: "Jollof Rice", region: "West Africa", note: "One-pot rice built on a deeply spiced, communal-cooking logic." },
      { name: "Plov", region: "Central Asia", note: "The closer ancestor — rice and meat cooked together, unlayered." },
    ],
  },
  {
    id: "baklava",
    name: "Baklava",
    cuisine: "Eastern Mediterranean",
    category: "sweet",
    emoji: "🍯",
    mood: "#D4A017",
    ingredients: ["phyllo dough", "chopped nuts", "butter", "honey or syrup"],
    lineage:
      "Layered pastry technique likely developed under the Ottoman court kitchens, later claimed and adapted by Greek, Levantine, and Central Asian cuisines alike.",
    similar: [
      { name: "Kunafa", region: "Levant", note: "Shares syrup-soaked richness, but uses shredded pastry, not layers." },
      { name: "Gulab Jamun", region: "South Asia", note: "A different technique, same instinct: fried dough drowned in syrup." },
      { name: "Sfogliatella", region: "Italy", note: "Another laminated pastry tradition, independently evolved." },
    ],
  },
  {
    id: "tiramisu",
    name: "Tiramisu",
    cuisine: "Italy",
    category: "sweet",
    emoji: "🍰",
    mood: "#B08968",
    ingredients: ["ladyfingers", "espresso", "mascarpone", "cocoa", "egg"],
    lineage:
      "A relatively young dish, formalized in the Veneto region in the 1960s-70s, built on the older Italian trifle tradition of soaked biscuit and cream.",
    similar: [
      { name: "Trifle", region: "England", note: "The layered soaked-cake-and-cream ancestor, minus the coffee." },
      { name: "Charlotte", region: "France", note: "Ladyfingers used as structure rather than a soaked layer." },
      { name: "Malabi", region: "Levant", note: "Different technique, same comfort-dessert instinct." },
    ],
  },
  {
    id: "dosa",
    name: "Dosa",
    cuisine: "South India",
    category: "baked",
    emoji: "🫓",
    mood: "#8FAF6B",
    ingredients: ["fermented rice batter", "urad dal", "salt", "oil"],
    lineage:
      "Built on an ancient fermentation technique unique to South India, the crepe likely predates most written food history in the region by centuries.",
    similar: [
      { name: "Crêpe", region: "France", note: "Same thin-griddled form, but unfermented and sweet-leaning." },
      { name: "Injera", region: "Ethiopia", note: "Another fermented flatbread, built to double as an edible plate." },
      { name: "Pesarattu", region: "Andhra Pradesh", note: "A close regional cousin using moong dal instead of rice." },
    ],
  },
  {
    id: "croissant",
    name: "Croissant",
    cuisine: "France",
    category: "baked",
    emoji: "🥐",
    mood: "#E0B873",
    ingredients: ["laminated dough", "butter", "yeast"],
    lineage:
      "Descended from the Austrian 'kipferl', brought to France in the 1800s and transformed through lamination into the flaky, buttery form known today.",
    similar: [
      { name: "Kipferl", region: "Austria", note: "The direct, denser ancestor, without the layered butter technique." },
      { name: "Sfogliatella", region: "Italy", note: "A different laminated pastry lineage, shell-shaped instead of curved." },
      { name: "Kouign-amann", region: "Brittany, France", note: "A sibling using the same lamination, pushed toward caramelized sugar." },
    ],
  },
  {
    id: "momo",
    name: "Momo",
    cuisine: "Tibet / Himalayas",
    category: "dish",
    emoji: "🥟",
    mood: "#5C7A9E",
    ingredients: ["wheat flour wrapper", "minced meat or vegetables", "ginger", "garlic"],
    lineage:
      "Traveled from Tibetan trade routes into Nepal and Northeast India, picking up local chutneys and fillings at each stop along the way.",
    similar: [
      { name: "Jiaozi", region: "China", note: "A likely common ancestor, sharing the fold-and-steam technique." },
      { name: "Mandu", region: "Korea", note: "Parallel evolution of the same dumpling logic." },
      { name: "Khinkali", region: "Georgia", note: "A twisted-top dumpling cousin from the other end of Asia." },
    ],
  },
  {
    id: "mochi",
    name: "Mochi",
    cuisine: "Japan",
    category: "sweet",
    emoji: "🍡",
    mood: "#E85C8A",
    ingredients: ["glutinous rice", "sugar", "water", "starch for dusting"],
    lineage:
      "Rooted in a centuries-old pounding ritual (mochitsuki), originally tied to New Year celebrations before becoming an everyday sweet.",
    similar: [
      { name: "Tteok", region: "Korea", note: "Another pounded-rice-cake tradition, less commonly stuffed." },
      { name: "Modak", region: "India", note: "Shares the stuffed-rice-dough form, steamed for festival occasions." },
      { name: "Kuih", region: "Southeast Asia", note: "A wide family of glutinous, often coconut-wrapped sweets." },
    ],
  },
];

function hexToRgba(hex, a) {
  const h = (hex || "#888888").replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

function loadLocalDishes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalDishes(dishes) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dishes));
  } catch (e) {
    // storage full or unavailable, fail silently
  }
}

const NEBULAE = [
  { top: "8%", left: "12%", size: 520, color: "rgba(232,162,75,0.10)" },
  { top: "62%", left: "78%", size: 620, color: "rgba(92,122,158,0.12)" },
  { top: "78%", left: "18%", size: 460, color: "rgba(232,92,138,0.09)" },
  { top: "20%", left: "70%", size: 500, color: "rgba(143,175,107,0.09)" },
];

function Starfield() {
  const stars = useMemo(
    () =>
      Array.from({ length: 180 }).map((_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: Math.random() * 2.2 + 0.5,
        dur: Math.random() * 3 + 2,
        delay: Math.random() * 3,
      })),
    []
  );
  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      <style>{`
        @keyframes twinkle { 0%,100% { opacity: 0.15; } 50% { opacity: 1; } }
        @keyframes floaty { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
        @keyframes driftglow { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(3%,-4%) scale(1.08); } }
      `}</style>
      {NEBULAE.map((n, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: n.top,
            left: n.left,
            width: n.size,
            height: n.size,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${n.color}, transparent 70%)`,
            filter: "blur(10px)",
            animation: `driftglow ${28 + i * 6}s ease-in-out infinite`,
          }}
        />
      ))}
      {stars.map((s) => (
        <div
          key={s.id}
          style={{
            position: "absolute",
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: s.size,
            height: s.size,
            borderRadius: "50%",
            background: "#fff",
            animation: `twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

function DetailOrbit({ dish }) {
  const size = 300;
  const cx = size / 2;
  const cy = size / 2;
  const points = dish.similar.map((s, i) => {
    const angle = (i / dish.similar.length) * Math.PI * 2 - Math.PI / 2;
    const r = 110;
    return { ...s, x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });
  return (
    <div style={{ position: "relative", width: size, height: size, margin: "0 auto" }}>
      <svg width={size} height={size} style={{ position: "absolute", inset: 0 }}>
        <circle cx={cx} cy={cy} r={110} fill="none" stroke={LINE} strokeDasharray="2,6" />
        {points.map((p, i) => (
          <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke={LINE} strokeWidth="1" />
        ))}
      </svg>
      <div
        style={{
          position: "absolute",
          left: cx,
          top: cy,
          transform: "translate(-50%,-50%)",
          width: 84,
          height: 84,
          borderRadius: "50%",
          background: `radial-gradient(circle at 30% 25%, ${hexToRgba(dish.mood, 0.5)}, ${CARD_BG} 75%)`,
          border: `2px solid ${dish.mood}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 32,
          boxShadow: `0 0 24px ${hexToRgba(dish.mood, 0.5)}`,
        }}
      >
        {dish.emoji}
      </div>
      {points.map((p, i) => (
        <div
          key={i}
          title={p.note}
          style={{
            position: "absolute",
            left: p.x,
            top: p.y,
            transform: "translate(-50%,-50%)",
            width: 54,
            height: 54,
            borderRadius: "50%",
            background: CARD_BG,
            border: `1.5px solid ${hexToRgba(dish.mood, 0.7)}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 8.5,
            textAlign: "center",
            padding: 2,
          }}
        >
          {p.name}
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [dishes, setDishes] = useState(SEED);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const local = loadLocalDishes();
    if (local.length) setDishes((d) => [...d, ...local]);
  }, []);

  // close open modals on Escape
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key !== "Escape") return;
      if (adding) {
        setAdding(false);
        setError(null);
        setNewName("");
      } else if (selected) {
        setSelected(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [adding, selected]);

  // cuisine pills are derived from whatever cuisines actually exist in the data,
  // so they never drift out of sync with the dishes themselves
  const cuisines = useMemo(() => {
    const seen = new Map();
    dishes.forEach((d) => {
      const slug = slugify(d.cuisine);
      if (slug && !seen.has(slug)) seen.set(slug, d.cuisine);
    });
    return [{ slug: "all", label: "All" }, ...Array.from(seen, ([slug, label]) => ({ slug, label }))];
  }, [dishes]);

  const filtered = dishes.filter((d) => {
    const matchesCuisine = filter === "all" || slugify(d.cuisine) === filter;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      d.name.toLowerCase().includes(q) ||
      (d.cuisine || "").toLowerCase().includes(q) ||
      (d.similar || []).some((s) => s.name.toLowerCase().includes(q));
    return matchesCuisine && matchesSearch;
  });

  const submitDish = async () => {
    const name = newName.trim();
    if (!name) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) throw new Error("bad response");
      const parsed = await response.json();
      if (!parsed.name || !Array.isArray(parsed.similar)) throw new Error("malformed");
      parsed.id = parsed.name.replace(/[^a-zA-Z]/g, "").toLowerCase() + Date.now();

      const updatedLocal = [...loadLocalDishes(), parsed];
      saveLocalDishes(updatedLocal);

      setDishes((d) => [...d, parsed]);
      setAdding(false);
      setNewName("");
      setSelected(parsed);
    } catch (e) {
      setError("Couldn't launch that dish into orbit — try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: BG,
        color: TEXT,
        fontFamily: "'IBM Plex Sans', sans-serif",
        overflow: "hidden",
      }}
    >
      <style>{FONT_IMPORT}</style>
      <Starfield />

      <GalaxyView dishes={filtered} onSelect={setSelected} />

      {/* Floating header, sits above the galaxy without constraining it */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 5,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "18px 16px 12px",
          pointerEvents: "none",
          background: "linear-gradient(180deg, rgba(5,6,15,0.9) 0%, rgba(5,6,15,0) 100%)",
        }}
      >
        <div
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 10.5,
            letterSpacing: 2,
            color: DUST,
            textTransform: "uppercase",
          }}
        >
          Find your food's cousin
        </div>
        <h1
          style={{
            fontFamily: "'Fraunces', serif",
            fontStyle: "italic",
            fontWeight: 500,
            fontSize: "clamp(22px, 5vw, 28px)",
            margin: "2px 0 10px",
          }}
        >
          Food Galaxy
        </h1>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="search a dish or cuisine…"
          aria-label="Search dishes"
          style={{
            width: "min(320px, 82vw)",
            background: "rgba(13,15,34,0.6)",
            border: `1px solid ${LINE}`,
            borderRadius: 20,
            padding: "7px 14px",
            color: TEXT,
            fontSize: 12.5,
            marginBottom: 10,
            boxSizing: "border-box",
            pointerEvents: "auto",
            backdropFilter: "blur(6px)",
          }}
        />

        <div
          style={{
            display: "flex",
            gap: 8,
            pointerEvents: "auto",
            maxWidth: "100%",
            overflowX: "auto",
            padding: "2px 4px 6px",
            scrollbarWidth: "none",
            justifyContent: cuisines.length > 6 ? "flex-start" : "center",
          }}
        >
          {cuisines.map((c) => (
            <button
              key={c.slug}
              onClick={() => setFilter(c.slug)}
              style={{
                background: filter === c.slug ? TEXT : "rgba(13,15,34,0.55)",
                color: filter === c.slug ? BG : DUST,
                border: `1px solid ${filter === c.slug ? TEXT : LINE}`,
                borderRadius: 20,
                padding: "6px 14px",
                fontSize: 12,
                fontFamily: "'IBM Plex Sans', sans-serif",
                cursor: "pointer",
                whiteSpace: "nowrap",
                flexShrink: 0,
                backdropFilter: "blur(6px)",
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          position: "fixed",
          top: 12,
          left: 14,
          zIndex: 5,
          fontSize: 11,
          color: "#8B8FB0",
          fontFamily: "'IBM Plex Mono', monospace",
          letterSpacing: 0.5,
          opacity: 0.7,
          pointerEvents: "none",
        }}
      >
        made by Tejaswini ❤️
      </div>


      {/* Floating action button to add a dish, doesn't interrupt the galaxy layout */}
      <button
        onClick={() => setAdding(true)}
        style={{
          position: "fixed",
          right: 22,
          bottom: 26,
          zIndex: 5,
          width: 58,
          height: 58,
          borderRadius: "50%",
          border: `1px solid ${DUST}`,
          background: "rgba(13,15,34,0.75)",
          color: TEXT,
          cursor: "pointer",
          fontSize: 26,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "blur(6px)",
          boxShadow: "0 0 22px rgba(0,0,0,0.4)",
        }}
        title="add a dish"
      >
        +
      </button>

      {adding && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(5,6,15,0.88)",
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div style={{ maxWidth: 380, width: "100%", background: CARD_BG, border: `1px solid ${LINE}`, borderRadius: 14, padding: 22 }}>
            <div style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", fontSize: 20, marginBottom: 6 }}>
              Send a dish into orbit
            </div>
            <div style={{ fontSize: 12, color: DUST, marginBottom: 14 }}>
              Enter any sweet, dish, or drink to find its cousin.
            </div>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Payasam, Pootharekulu, Kimchi jjigae..."
              style={{
                width: "100%",
                background: BG,
                border: `1px solid ${LINE}`,
                borderRadius: 8,
                padding: "10px 12px",
                color: TEXT,
                fontSize: 14,
                marginBottom: 12,
                boxSizing: "border-box",
              }}
            />
            {error && <div style={{ color: "#E85C5C", fontSize: 12, marginBottom: 10 }}>{error}</div>}
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button
                onClick={() => {
                  setAdding(false);
                  setError(null);
                  setNewName("");
                }}
                style={{ background: "transparent", border: `1px solid ${LINE}`, color: DUST, borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 12.5 }}
              >
                cancel
              </button>
              <button
                onClick={submitDish}
                disabled={loading}
                style={{ background: TEXT, color: BG, border: "none", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 12.5, fontWeight: 600 }}
              >
                {loading ? "launching…" : "launch it"}
              </button>
            </div>
          </div>
        </div>
      )}

      {selected && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(5,6,15,0.92)",
            zIndex: 10,
            overflowY: "auto",
            padding: "30px 16px 60px",
          }}
        >
          <div style={{ maxWidth: 420, margin: "0 auto" }}>
            <button
              onClick={() => setSelected(null)}
              style={{ background: "transparent", border: `1px solid ${LINE}`, color: DUST, borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 12, marginBottom: 18 }}
            >
              ← back to galaxy
            </button>

            <DetailOrbit dish={selected} />

            <div style={{ textAlign: "center", marginTop: 10 }}>
              <div style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", fontSize: 26 }}>{selected.name}</div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: selected.mood }}>
                {selected.cuisine} · {selected.category}
              </div>
            </div>

            <div style={{ background: CARD_BG, border: `1px solid ${LINE}`, borderRadius: 12, padding: 16, marginTop: 18 }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, color: DUST, textTransform: "uppercase", marginBottom: 8 }}>
                lineage
              </div>
              <p style={{ fontSize: 13.5, lineHeight: 1.6, margin: 0, color: "#D6D9E8" }}>{selected.lineage}</p>
            </div>

            <div style={{ marginTop: 14 }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, color: DUST, textTransform: "uppercase", marginBottom: 8 }}>
                core ingredients
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {selected.ingredients.map((ing, i) => (
                  <span
                    key={i}
                    style={{
                      border: `1px solid ${hexToRgba(selected.mood, 0.6)}`,
                      color: TEXT,
                      borderRadius: 20,
                      padding: "5px 12px",
                      fontSize: 12,
                    }}
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 18 }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, color: DUST, textTransform: "uppercase", marginBottom: 8 }}>
                cousins across the globe
              </div>
              {selected.similar.map((s, i) => (
                <div key={i} style={{ borderLeft: `2px solid ${hexToRgba(selected.mood, 0.6)}`, paddingLeft: 12, marginBottom: 10 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>
                    {s.name} <span style={{ color: DUST, fontWeight: 400, fontSize: 11.5 }}>· {s.region}</span>
                  </div>
                  <div style={{ fontSize: 12.5, color: "#D6D9E8", marginTop: 2 }}>{s.note}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
