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
      image_url: "pending"
    };

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/build_requests`,
      {
        method: "POST",
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
          "Prefer": "return=representation"
        },
        body: JSON.stringify(payload)
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.error(data);
      alert("Error saving request");
      return;
    }

    $("result").textContent =
      "REQUEST CREATED SUCCESSFULLY!";
  } catch (err) {
    console.error(err);
    alert("Something went wrong.");
  }
});
