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
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    const textBlock = (data.content || []).find((b) => b.type === "text");
    if (!textBlock) throw new Error("No text in response");

    const cleaned = textBlock.text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return res.status(200).json(parsed);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to generate dish" });
  }
}
