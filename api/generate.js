export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name } = req.body || {};

  if (!name) {
    return res.status(400).json({ error: "Missing dish name" });
  }

  const prompt = `
You catalog dishes, sweets, and baked goods for an interactive "food galaxy" app.

A user submitted this dish: "${name}"

Return ONLY valid JSON.

{
  "name": "",
  "cuisine": "",
  "category": "sweet | dish | baked",
  "emoji": "",
  "mood": "#E8A24B",
  "ingredients": [],
  "lineage": "",
  "similar": [
    {
      "name": "",
      "region": "",
      "note": ""
    }
  ]
}

Return exactly 3 similar dishes.
`;

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
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    console.log(data);if (data.error?.code === 503) {
      return res.status(503).json({
        error: "Galaxy is busy. Please try again in a few seconds."
      });
    }

    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error("Gemini returned no text.");
    }

    const cleaned = text.replace(/```json|```/g, "").trim();

    const parsed = JSON.parse(cleaned);

    return res.status(200).json(parsed);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: "Failed to generate dish",
    });
  }
}