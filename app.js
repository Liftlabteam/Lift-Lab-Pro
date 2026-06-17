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

    const generateText = await generateRes.text();

    let generateData;
    try {
      generateData = JSON.parse(generateText);
      console.log("GENERATE DATA:", generateData);
alert(JSON.stringify(generateData).slice(0, 1000));
    } catch {
      alert("API returned non-JSON error: " + generateText);
      return;
    }

    if (!generateRes.ok) {
      alert(JSON.stringify(generateData));
      return;
    }

alert("API RESPONSE: " + JSON.stringify(generateData).slice(0, 1000));

if (generateData.b64_json) {
  $("result").innerHTML = "";

  const title = document.createElement("h2");
  title.textContent = "Render Generated ✅";

  const img = document.createElement("img");
  img.src = "data:image/png;base64," + generateData.b64_json;
  img.alt = "Generated truck render";
  img.style.width = "100%";
  img.style.maxWidth = "600px";
  img.style.borderRadius = "16px";
  img.style.marginTop = "20px";

$("result").appendChild(title);

console.log(img.src);

document.body.appendChild(img);

$("result").appendChild(img);

  return;
}

    if (generateData.image && generateData.image.b64_json) {
      $("result").innerHTML = `
        <h2>Render Generated ✅</h2>
        <img
          src="data:image/png;base64,${generateData.image.b64_json}"
          alt="Generated truck render"
          style="width:100%; max-width:600px; border-radius:16px; margin-top:20px;"
        />
      `;
      return;
    }

    $("result").textContent =
      "RENDER GENERATED ✅\n\n" + JSON.stringify(generateData, null, 2);

  } catch (err) {
    console.error(err);
    alert("Something went wrong: " + err.message);
  }
});
