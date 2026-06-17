export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const {
      wheel_brand,
      wheel_size,
      wheel_cut,
      wheel_finish,
      lift_brand,
      lift_height,
      primary_powder_color,
      secondary_powder_color,
      notes,
      original_image_url
    } = req.body || {};

    const prompt = `
Edit the uploaded truck photo. Do NOT create a new truck.

Strict rules:
- Preserve the exact same truck year, make, model, cab, bed, grille, headlights, mirrors, paint color, body lines, camera angle, lighting, and background.
- Do not change the truck color.
- Do not change the body style.
- Do not change the front end.
- Do not change the scene.
- Only modify the wheels, tires, lift height, stance, and visible suspension/powder coat parts.

Requested modifications:
- Wheel brand/style: ${wheel_brand}
- Wheel size: ${wheel_size}
- Wheel cut/style: ${wheel_cut}
- Wheel finish: ${wheel_finish}
- Lift brand: ${lift_brand}
- Lift height: ${lift_height}
- Primary powder coat color: ${primary_powder_color}
- Secondary powder coat color: ${secondary_powder_color}
- Notes: ${notes}

Make it photorealistic and believable.
`;

    const openaiRes = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        images: [
          {
            image_url: original_image_url
          }
        ],
        prompt,
        size: "1024x1024"
      })
    });

    const openaiData = await openaiRes.json();

    if (!openaiRes.ok) {
      return res.status(200).json({
        success: false,
        error: "OpenAI image edit failed",
        details: openaiData
      });
    }

    const b64 = openaiData?.data?.[0]?.b64_json;

    if (!b64) {
      return res.status(200).json({
        success: false,
        error: "No image returned",
        details: openaiData
      });
    }

    return res.status(200).json({
      success: true,
      b64_json: b64
    });

  } catch (err) {
    return res.status(200).json({
      success: false,
      error: "Server crashed",
      details: err.message
    });
  }
}
