const $=id=>document.getElementById(id);
function getRequests(){return JSON.parse(localStorage.getItem("llp_requests")||"[]")}
function saveRequests(x){localStorage.setItem("llp_requests",JSON.stringify(x));renderRequests()}
function makePrompt(d){return `LiftLab Pro render prompt:
Create a photorealistic custom truck preview from the uploaded image.
Keep the exact truck body, paint, angle, lighting, and background.
Modify only the requested build parts.

Wheel brand: ${d.wheel_brand}
Wheel size: ${d.wheel_size}
Wheel cut: ${d.wheel_cut}
Wheel color/finish: ${d.wheel_finish}
Lift kit size: ${d.lift_size}
Lift kit brand: ${d.lift_brand}
Powder primary color: ${d.powder_primary}
Powder secondary color: ${d.powder_secondary}
Extra notes: ${d.notes}

Style: realistic SEMA-quality truck photography. No cartoon look. No distorted body. No fake text.`;
}
$("photo").addEventListener("change",e=>{
 const f=e.target.files[0]; if(!f)return;
 $("previewImg").src=URL.createObjectURL(f); $("previewImg").style.display="block";
});
$("form").addEventListener("submit",e=>{
 e.preventDefault();
 const f=$("photo").files[0]; if(!f){alert("Upload a truck photo first.");return}
 const reader=new FileReader();
 reader.onload=()=>{
  const d={
   id:Date.now(),status:"Pending render",created_at:new Date().toLocaleString(),
   name:$("name").value,contact:$("contact").value,image:reader.result,
   wheel_brand:$("wheel_brand").value,wheel_size:$("wheel_size").value,wheel_cut:$("wheel_cut").value,wheel_finish:$("wheel_finish").value,
   lift_size:$("lift_size").value,lift_brand:$("lift_brand").value,powder_primary:$("powder_primary").value,powder_secondary:$("powder_secondary").value,
   notes:$("notes").value
  };
  d.prompt=makePrompt(d);
  const list=getRequests(); list.unshift(d); saveRequests(list);
  $("result").textContent="REQUEST CREATED ✅\n\nFirst render is free.\nAfter that: $10/render or $25/month unlimited.\n\n"+d.prompt;
 };
 reader.readAsDataURL(f);
});
function renderRequests(){
 const list=getRequests();
 $("requests").innerHTML=list.map(d=>`<div class="card req"><img src="${d.image}"><p><span class="badge">${d.status}</span></p><h3>${d.name||"No name"}</h3><p>${d.contact||"No contact"}</p><p><b>Wheels:</b> ${d.wheel_brand||""} ${d.wheel_size||""}</p><p><b>Lift:</b> ${d.lift_size||""} ${d.lift_brand||""}</p><p><b>Powder:</b> ${d.powder_primary||""} ${d.powder_secondary||""}</p><p>${d.created_at}</p></div>`).join("")||"<p class='muted'>No requests yet.</p>";
}
function exportData(){$("exportBox").textContent=JSON.stringify(getRequests(),null,2)}
function clearData(){if(confirm("Clear all saved demo requests?")){saveRequests([]);$("exportBox").textContent=""}}
renderRequests();