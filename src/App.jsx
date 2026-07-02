import { useState, useEffect, useMemo } from "react";

const FONT_IMPORT = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;1,9..144,500&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
`;

const BG = "#05060F";
const CARD_BG = "#0D0F22";
const TEXT = "#EDEBF5";
const DUST = "#8B8FB0";
const LINE = "#22254A";
const STORAGE_KEY = "food-galaxy-dishes";

const CATEGORIES = ["all", "sweet", "dish", "baked"];

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

function Starfield() {
  const stars = useMemo(
    () =>
      Array.from({ length: 70 }).map((_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: Math.random() * 2 + 0.5,
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
      `}</style>
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

function FoodCard({ dish, onClick, index }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: `radial-gradient(circle at 30% 25%, ${hexToRgba(dish.mood, 0.35)}, ${CARD_BG} 70%)`,
        border: `1px solid ${hexToRgba(dish.mood, 0.5)}`,
        borderRadius: 16,
        padding: "18px 10px 14px",
        width: 118,
        cursor: "pointer",
        color: TEXT,
        boxShadow: `0 0 18px ${hexToRgba(dish.mood, 0.18)}`,
        animation: `floaty ${3 + (index % 4) * 0.4}s ease-in-out ${(index % 5) * 0.3}s infinite`,
      }}
    >
      <div style={{ fontSize: 34 }}>{dish.emoji}</div>
      <div style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", fontSize: 14.5, marginTop: 6 }}>
        {dish.name}
      </div>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: DUST, marginTop: 2 }}>
        {dish.cuisine}
      </div>
    </button>
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
  const [selected, setSelected] = useState(null);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [description, setDescription] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const resetAddForm = () => {
    setNewName("");
    setDescription("");
    setImagePreview(null);
    setError(null);
  };

  useEffect(() => {
    const local = loadLocalDishes();
    if (local.length) setDishes((d) => [...d, ...local]);
  }, []);

  const filtered = dishes.filter((d) => filter === "all" || d.category === filter);

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
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Couldn't generate dish."
        );
      }
      const parsed = await response.json();
      if (!parsed.name || !Array.isArray(parsed.similar)) throw new Error("malformed");
      parsed.id = parsed.name.replace(/[^a-zA-Z]/g, "").toLowerCase() + Date.now();

      const updatedLocal = [...loadLocalDishes(), parsed];
      saveLocalDishes(updatedLocal);

      setDishes((d) => [...d, parsed]);
      setAdding(false);
      resetAddForm();
      setSelected(parsed);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: BG,
        color: TEXT,
        fontFamily: "'IBM Plex Sans', sans-serif",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      <style>{FONT_IMPORT}</style>
      <Starfield />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 480, margin: "0 auto", padding: "26px 16px 60px" }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 10.5,
              letterSpacing: 2,
              color: DUST,
              textTransform: "uppercase",
            }}
          >
            a galaxy of food
          </div>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", fontWeight: 500, fontSize: 32, margin: "4px 0 0" }}>
            Food Galaxy
          </h1>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 22, flexWrap: "wrap" }}>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              style={{
                background: filter === c ? TEXT : "transparent",
                color: filter === c ? BG : DUST,
                border: `1px solid ${filter === c ? TEXT : LINE}`,
                borderRadius: 20,
                padding: "6px 14px",
                fontSize: 12,
                fontFamily: "'IBM Plex Sans', sans-serif",
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {c}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
          <button
            onClick={() => setAdding(true)}
            style={{
              background: TEXT,
              color: BG,
              border: "none",
              borderRadius: 20,
              padding: "8px 18px",
              fontSize: 12.5,
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Add Dish
          </button>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center" }}>
          {filtered.map((d, i) => (
            <FoodCard key={d.id} dish={d} index={i} onClick={() => setSelected(d)} />
          ))}
        </div>
      </div>

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
              Any sweet, dish, or baked good. Saved to your device's atlas.
            </div>

            <label style={{ display: "block", fontSize: 12, color: DUST, marginBottom: 6 }}>
              Food Name <span style={{ color: TEXT }}>*</span>
            </label>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. pootharekulu, kimchi jjigae, cannoli…"
              style={{
                width: "100%",
                background: BG,
                border: `1px solid ${LINE}`,
                borderRadius: 8,
                padding: "10px 12px",
                color: TEXT,
                fontSize: 14,
                marginBottom: 14,
                boxSizing: "border-box",
              }}
            />

            <label style={{ display: "block", fontSize: 12, color: DUST, marginBottom: 6 }}>
              Description <span style={{ color: DUST, fontSize: 11 }}>(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A short note about this dish…"
              rows={3}
              style={{
                width: "100%",
                background: BG,
                border: `1px solid ${LINE}`,
                borderRadius: 8,
                padding: "10px 12px",
                color: TEXT,
                fontSize: 14,
                marginBottom: 14,
                boxSizing: "border-box",
                resize: "vertical",
                fontFamily: "'IBM Plex Sans', sans-serif",
              }}
            />

            <label style={{ display: "block", fontSize: 12, color: DUST, marginBottom: 6 }}>
              Image <span style={{ color: DUST, fontSize: 11 }}>(optional)</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) {
                  setImagePreview(null);
                  return;
                }
                const reader = new FileReader();
                reader.onload = () => setImagePreview(reader.result);
                reader.readAsDataURL(file);
              }}
              style={{
                width: "100%",
                fontSize: 12,
                color: DUST,
                marginBottom: imagePreview ? 10 : 14,
              }}
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                style={{
                  width: "100%",
                  maxHeight: 120,
                  objectFit: "cover",
                  borderRadius: 8,
                  border: `1px solid ${LINE}`,
                  marginBottom: 14,
                }}
              />
            )}

            {error && <div style={{ color: "#E85C5C", fontSize: 12, marginBottom: 10 }}>{error}</div>}
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button
                onClick={() => {
                  setAdding(false);
                  resetAddForm();
                }}
                style={{ background: "transparent", border: `1px solid ${LINE}`, color: DUST, borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 12.5 }}
              >
                Cancel
              </button>
              <button
                onClick={submitDish}
                disabled={loading || !newName.trim()}
                style={{
                  background: TEXT,
                  color: BG,
                  border: "none",
                  borderRadius: 8,
                  padding: "8px 14px",
                  cursor: loading || !newName.trim() ? "not-allowed" : "pointer",
                  fontSize: 12.5,
                  fontWeight: 600,
                  opacity: loading || !newName.trim() ? 0.5 : 1,
                }}
              >
                {loading ? "Generating…" : "Generate"}
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
