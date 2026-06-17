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
You are editing an existing truck photo, NOT generating a new truck.

ABSOLUTE RULE #1:
The truck in the uploaded image must remain the exact same truck.

Keep these EXACTLY the same:

Year
Make
Model
Trim level
Cab style
Bed length
Paint color
Body lines
Front bumper
Rear bumper
Grille
Headlights
Taillights
Mirrors
Fender shape
Hood
Doors
Windows
Decals
Emblems
Wheel openings
Camera angle
Lighting
Background
Location
Ground
Shadows
Reflection
Image perspective

DO NOT:

Change the truck color
Change the body style
Change the front end
Change the cab
Change the bed
Change the generation of truck
Change the make or model
Create a different truck
Move the truck
Change the background
Change the camera angle
Change the photo composition

ONLY MODIFY:

Wheels
Tires
Lift height
Stance
Visible suspension components
Powder coat colors on suspension components

Build Specifications:

Wheel Brand: ${wheel_brand}
Wheel Size: ${wheel_size}
Wheel Cut: ${wheel_cut}
Wheel Finish: ${wheel_finish}
Lift Brand: ${lift_brand}
Lift Height: ${lift_height}
Primary Powder Coat Color: ${primary_powder_color}
Secondary Powder Coat Color: ${secondary_powder_color}
Additional Notes: ${notes}

LIFT ACCURACY:
The lift height must be visually accurate.
Do not over-lift or under-lift the truck.
Maintain realistic suspension geometry and tire fitment.

FINAL GOAL:
The customer should immediately recognize this as THEIR EXACT truck photo with only the requested modifications installed.
Photorealistic. SEMA-quality. No cartoon styling.
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
