try {
  throw new Error("TEST_GEMINI_DEPLOY");

  const response = await fetch(
    ...
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name } = req.body || {};
  if (!name || typeof name !== "string") {
    return res.status(400).json({ error: "Missing dish name" });
  }

  const prompt = `You catalog dishes, sweets, and baked goods for an interactive "food galaxy" app.

A user submitted this dish: "${name}"

Return ONLY a JSON object, no prose, no markdown fences, matching exactly:
{
  "name": "clean display name of the dish",
  "cuisine": "region or culture of origin",
  "category": "one of: sweet, dish, baked",
  "emoji": "a single emoji that best represents it",
  "mood": "a hex color capturing its visual/flavor mood, e.g. #E8A24B",
  "ingredients": ["4-6 core ingredients, lowercase, short"],
  "lineage": "1-2 original sentences on its origin and how it traveled or evolved, under 40 words",
  "similar": [
    { "name": "a related dish elsewhere in the world", "region": "its region", "note": "one short original sentence on the connection, under 18 words" }
  ]
}
Include exactly 3 items in "similar", from genuinely different regions where possible.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );
    
    const data = await response.json();

    if (!response.ok) {
      console.error(data);
      throw new Error(data.error?.message || "Gemini API request failed");
    }
    
    const cleaned = data.candidates?.[0]?.content?.parts?.[0]?.text
      ?.replace(/```json|```/g, "")
      .trim();
    
    if (!cleaned) {
      console.error(data);
      throw new Error("No text in Gemini response");
    }
    const parsed = JSON.parse(cleaned);

    return res.status(200).json(parsed);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to generate dish" });
  }
}
