const SUPABASE_URL = "https://xrrfridfgezcsktectlr.supabase.co";
const SUPABASE_KEY = "sb_publishable_CosRhU39EbzOj2nKyFpOqw_VEc4Yg0V";

const $ = id => document.getElementById(id);

$("photo").addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;

  $("previewImg").src = URL.createObjectURL(file);
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

    const saveRes = await fetch(`${SUPABASE_URL}/rest/v1/build_requests`, {
      method: "POST",
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "return=representation"
      },
      body: JSON.stringify(payload)
    });

    const saveText = await saveRes.text();
    let saveData = null;

    try {
      saveData = saveText ? JSON.parse(saveText) : null;
    } catch {
      alert("Supabase returned non-JSON error: " + saveText);
      return;
    }

    if (!saveRes.ok) {
      alert(JSON.stringify(saveData));
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
    } catch {
      alert("API returned non-JSON error: " + generateText);
      return;
    }

    if (!generateRes.ok || generateData.success === false) {
      alert(JSON.stringify(generateData));
      return;
    }

    const b64 = generateData.b64_json || generateData.image?.b64_json;

    if (!b64) {
      $("result").textContent =
        "RENDER RETURNED, BUT NO IMAGE FOUND:\n\n" +
        JSON.stringify(generateData, null, 2);
      return;
    }

    $("result").innerHTML = "";

    const title = document.createElement("h2");
    title.textContent = "Render Generated ✅";
    title.style.marginBottom = "16px";

    const img = document.createElement("img");
    img.src = "data:image/png;base64," + b64;
    img.alt = "Generated truck render";
    img.style.display = "block";
    img.style.width = "100%";
    img.style.maxWidth = "700px";
    img.style.borderRadius = "16px";
    img.style.marginTop = "20px";

    $("result").appendChild(title);
    $("result").appendChild(img);

  } catch (err) {
    console.error(err);
    alert("Something went wrong: " + err.message);
  }
});
