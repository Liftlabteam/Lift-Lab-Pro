export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const {
      name,
      contact,
      wheel_brand,
      wheel_size,
      wheel_cut,
      wheel_finish,
      lift_brand,
      lift_height,
      primary_powder_color,
      secondary_powder_color,
      notes
    } = req.body;

    const prompt = `
Create a photorealistic custom lifted truck render.

Keep the truck body realistic and lifelike.
Show the truck with these modifications:
- Wheel brand: ${wheel_brand}
- Wheel size: ${wheel_size}
- Wheel cut/style: ${wheel_cut}
- Wheel finish: ${wheel_finish}
- Lift brand: ${lift_brand}
- Lift height: ${lift_height}
- Primary powder coat color: ${primary_powder_color}
- Secondary powder coat color: ${secondary_powder_color}
- Extra notes: ${notes}

Make it look like a real truck photo, not a cartoon.
High-end SEMA show truck style.
`;

    const openaiRes = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt: prompt,
        size: "1024x1024"
      })
    });

    const openaiData = await openaiRes.json();

    if (!openaiRes.ok) {
      return res.status(200).json({
        error: "OpenAI image generation failed",
        details: openaiData
      });
    }

    return res.status(200).json({
      success: true,
      image: openaiData.data?.[0],
      prompt
    });

  } catch (err) {
    return res.status(500).json({
      error: "Server error",
      details: err.message
    });
  }
}
