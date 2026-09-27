const seedItems = [
  {id:1,type:"lost",name:"Black Wallet",category:"Accessories",location:"Central Library",date:"2026-09-25",description:"Black leather wallet with a small college ID card inside."},
  {id:2,type:"found",name:"Blue Water Bottle",category:"Other",location:"Block A Canteen",date:"2026-09-24",description:"Blue insulated bottle with a small white sticker."},
  {id:3,type:"lost",name:"Wireless Earbuds",category:"Electronics",location:"Computer Lab 2",date:"2026-09-23",description:"White earbuds case, brand logo on the front."},
  {id:4,type:"found",name:"Student ID Card",category:"Documents",location:"Main Auditorium",date:"2026-09-26",description:"ID card found near the second entrance."},
  {id:5,type:"lost",name:"Data Structures Book",category:"Books",location:"Reading Room",date:"2026-09-22",description:"Blue-cover textbook with handwritten notes on first page."},
  {id:6,type:"found",name:"Black USB Drive",category:"Electronics",location:"ECE Lab",date:"2026-09-25",description:"32GB black USB drive found near a desktop."}
];

let items = JSON.parse(localStorage.getItem("findback_items") || "null") || seedItems;
let currentType = "all";

const iconMap = {Electronics:"🎧",Documents:"🪪",Accessories:"👛",Books:"📚",Other:"📦"};

function save(){ localStorage.setItem("findback_items", JSON.stringify(items)); }

function possibleMatches(item){
  return items.filter(x => x.id !== item.id && x.type !== item.type &&
    (x.category === item.category || x.location.toLowerCase().includes(item.location.toLowerCase()) ||
     item.location.toLowerCase().includes(x.location.toLowerCase()) ||
     x.description.toLowerCase().split(" ").some(w => w.length > 4 && item.description.toLowerCase().includes(w))))
    .slice(0,2);
}

function render(){
  const q = document.getElementById("searchInput").value.toLowerCase().trim();
  const cat = document.getElementById("categoryFilter").value;
  const filtered = items.filter(x => {
    const text = `${x.name} ${x.category} ${x.location} ${x.description}`.toLowerCase();
    return (currentType==="all" || x.type===currentType) && (cat==="all" || x.category===cat) && text.includes(q);
  });
  const grid = document.getElementById("itemGrid");
  grid.innerHTML = "";
  document.getElementById("emptyState").classList.toggle("hidden", filtered.length !== 0);
  filtered.forEach(x => {
    const matches = possibleMatches(x);
    const el = document.createElement("article");
    el.className = "item";
    el.innerHTML = `
      <div class="item-top"><div class="icon">${iconMap[x.category] || "📦"}</div><span class="badge ${x.type}">${x.type.toUpperCase()}</span></div>
      <h3>${escapeHtml(x.name)}</h3>
      <p>${escapeHtml(x.description)}</p>
      <div class="item-meta"><span class="meta">📍 ${escapeHtml(x.location)}</span><span class="meta">📅 ${escapeHtml(x.date)}</span><span class="meta">${escapeHtml(x.category)}</span></div>
      ${matches.length ? `<div class="match">✨ ${matches.length} possible match${matches.length>1?"es":""} found</div>` : ""}
    `;
    grid.appendChild(el);
  });
  document.getElementById("totalCount").textContent = items.length;
  document.getElementById("lostCount").textContent = items.filter(x=>x.type==="lost").length;
  document.getElementById("foundCount").textContent = items.filter(x=>x.type==="found").length;
  document.getElementById("matchCount").textContent = items.filter(x=>possibleMatches(x).length).length;
}

function escapeHtml(s){return s.replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}

document.querySelectorAll(".filter").forEach(btn=>{
  btn.addEventListener("click",()=>{
    document.querySelectorAll(".filter").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active"); currentType=btn.dataset.filter; render();
  });
});
document.getElementById("searchInput").addEventListener("input",render);
document.getElementById("categoryFilter").addEventListener("change",render);

document.getElementById("reportForm").addEventListener("submit",e=>{
  e.preventDefault();
  const type = document.querySelector('input[name="type"]:checked').value;
  items.unshift({
    id: Date.now(), type,
    name: document.getElementById("itemName").value.trim(),
    category: document.getElementById("category").value,
    location: document.getElementById("location").value.trim(),
    date: document.getElementById("date").value,
    description: document.getElementById("description").value.trim()
  });
  save(); render(); e.target.reset();
  document.getElementById("date").value = new Date().toISOString().slice(0,10);
  showToast("Report published successfully!");
  location.hash = "items";
});

function showToast(msg){
  const t=document.getElementById("toast");t.textContent=msg;t.classList.add("show");
  setTimeout(()=>t.classList.remove("show"),2500);
}
document.getElementById("date").value = new Date().toISOString().slice(0,10);
render();
