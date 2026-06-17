const SUPABASE_URL = "https://xrrfridfgezcsktectlr.supabase.co";
const SUPABASE_KEY = "sb_publishable_CosRhU39EbzOj2nKyFpOqw_VEc4Yg0V";

const $ = id => document.getElementById(id);

$("photo").addEventListener("change", e => {
  const f = e.target.files[0];
  if (!f) return;

  $("previewImg").src = URL.createObjectURL(f);
  $("previewImg").style.display = "block";
});

$("form").addEventListener("submit", async e => {
  e.preventDefault();

  try {
    const file = $("photo").files[0];

    if (!file) {
      alert("Please upload a truck photo first.");
      return;
    }

    $("result").textContent = "UPLOADING PHOTO...";

    const fileName = `${Date.now()}-${file.name}`;

    const uploadRes = await fetch(
      `${SUPABASE_URL}/storage/v1/object/truck-photos/${fileName}`,
      {
        method: "POST",
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`,
          "Content-Type": file.type
        },
        body: file
      }
    );

    if (!uploadRes.ok) {
      const uploadError = await uploadRes.text();
      alert("Image upload failed: " + uploadError);
      return;
    }

    const imageUrl = `${SUPABASE_URL}/storage/v1/object/public/truck-photos/${fileName}`;

    const payload = {
      name: $("name").value,
      contact: $("contact").value,
      wheel_brand: $("wheel_brand").value,
      wheel_size: $("wheel_size").value,
      wheel_cut: $("wheel_cut").value,
      wheel_finish: $("wheel_finish").value,
      lift_brand: $("lift_brand").value,
      lift_height: $("lift_size").value,
      primary_powder_color: $("powder_primary").value,
      secondary_powder_color: $("powder_secondary").value,
      notes: $("notes").value,
      original_image_url: imageUrl,
      rendered_image_url: "pending"
    };

    $("result").textContent = "SAVING REQUEST...";

    const res = await fetch(`${SUPABASE_URL}/rest/v1/build_requests`, {
      method: "POST",
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "return=representation"
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      alert(JSON.stringify(data));
      return;
    }

    $("result").textContent = "REQUEST SAVED. GENERATING RENDER...";

    const generateRes = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const generateData = await generateRes.json();

    if (!generateRes.ok) {
      alert(JSON.stringify(generateData));
      return;
    }

if (generateData.b64_json) {
  $("result").innerHTML = `
    <h2>Render Generated ✅</h2>
    <img 
      src="data:image/png;base64,${generateData.b64_json}" 
      alt="Generated truck render"
      style="width:100%; max-width:600px; border-radius:16px; margin-top:20px;"
    />
  `;
} else {
  $("result").textContent =
    "RENDER GENERATED ✅\n\n" + JSON.stringify(generateData, null, 2);
}
# POST /api/generate

Status: 200

## Request

Started: Jun 16 19:20:54.73 GMT-5

Request ID: 6qfdd-1781655654735-6a6b91a9606e

Path: /api/generate

Host: lift-lab-pro.vercel.app

User Agent: Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36

Referer: https://lift-lab-pro.vercel.app/

Received in Cleveland, USA (cle1)

Firewall Allowed

Routed to Washington, D.C., USA (iad1)

### Function Invocation

Route: / api / generate

Execution Duration / Maximum: 38.29s / 5m

External APIs

| Method | Request |
| --- | --- |
| POST | Button: api.openai.com/v1/images/generations |

### Fluid

276 MB

Response finished in 39s

## Deployment Information

Deployment ID: dpl_FuR7kNZbvEMDMthScgEog1NVHNHQ

Environment: production

Branch: main
}

  } catch (err) {
    console.error(err);
    alert("Something went wrong.");
  }
});
