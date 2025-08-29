/* ------------------------------------------------------
 * DMRC clone – Multi-line routes with interchanges
 * - Each line has >=10 stations where possible
 * - Shorter lines (Airport, Grey) include all stations
 * - Distances are per-edge (km). Tune for accuracy.
 * - Fare slabs: 0–2=₹10, 2–5=₹20, 5–12=₹30, 12–21=₹40, 21–32=₹50, >32=₹60
 * ----------------------------------------------------- */

const LINE_COLORS = {
  Yellow: "#ffd400",
  Blue:   "#005bbb",
  Red:    "#e03131",
  Green:  "#2b8a3e",
  Violet: "#6f42c1",
  Magenta:"#ff00aa",
  Pink:   "#ff6ea7",
  Grey:   "#6c757d",
  Airport:"#00a3a3",
  Aqua:   "#00bcd4" // Noida Metro (for demo)
};

// Helper to create legend UI
function renderLegend() {
  const legend = document.getElementById("legend");
  legend.innerHTML = "";
  Object.entries(LINE_COLORS).forEach(([name, color]) => {
    const el = document.createElement("span");
    el.className = "badge";
    el.innerHTML = `<span class="dot" style="background:${color}"></span>${name}`;
    legend.appendChild(el);
  });
}

/* ------------- DATA: Stations per line (>=10 where possible) -------------
 * Each station: { id, name, line, kmToNext }
 * kmToNext = distance to the next station on the same line (approx km)
 * Interchanges are created automatically when the same name appears on 2+ lines
 */

const LINES = {
  Yellow: [
    s("Samaypur Badli"), k(1.1),
    s("Azadpur"),        k(1.2),
    s("Model Town"),     k(1.0),
    s("Vishwavidyalaya"),k(1.0),
    s("Vidhan Sabha"),   k(1.0),
    s("Civil Lines"),    k(1.4),
    s("Kashmere Gate"),  k(1.0),
    s("Chandni Chowk"),  k(0.9),
    s("Chawri Bazar"),   k(1.0),
    s("New Delhi"),      k(0.9),
    s("Rajiv Chowk"),    k(1.2),
    s("Patel Chowk"),    k(1.3),
    s("Central Secretariat"),k(1.6),
    s("Udyog Bhawan"),   k(1.0),
    s("INA"),            k(1.1),
    s("AIIMS"),          k(1.2),
    s("Green Park"),     k(1.3),
    s("Hauz Khas"),      k(1.5),
    s("Malviya Nagar"),  k(1.4),
    s("Saket"),          k(2.0),
    s("Qutub Minar"),    k(1.6),
    s("Chhatarpur"),     k(1.7),
    s("Sultanpur"),      k(1.7),
    s("Ghitorni"),       k(1.7),
    s("Arjan Garh"),     k(1.8),
    s("Guru Dronacharya"),k(1.4),
    s("Sikandarpur"),    k(1.2),
    s("MG Road"),        k(1.2),
    s("IFFCO Chowk"),    k(1.5),
    s("HUDA City Centre"),k(0)
  ],
  Blue: [
    s("Dwarka Sector 21"),k(1.3),
    s("Dwarka Sector 8"), k(1.1),
    s("Dwarka Sector 9"), k(1.2),
    s("Dwarka Sector 10"),k(1.1),
    s("Dwarka Sector 11"),k(1.2),
    s("Dwarka Sector 12"),k(1.1),
    s("Dwarka Sector 13"),k(1.0),
    s("Dwarka Sector 14"),k(1.2),
    s("Dwarka"),           k(1.6),
    s("Janakpuri West"),   k(2.1),
    s(" Uttam Nagar east"), k(1.5),
    s(" Uttam Nagar west"),k(1.7),
    s("Rajouri Garden"),   k(2.4),
    s("Karol Bagh"),       k(2.1),
    
    s("RK Ashram Marg"),   k(0.9),
    s("Rajiv Chowk"),      k(2.1),
    s("Yamuna Bank"),      k(1.5),
    s("Akshardham"),       k(1.7),
    s("Mayur Vihar–I"),    k(1.6),
    s("Noida Sector 15"),  k(1.5),
    s("Noida Sector 16"),  k(1.3),
    s("Noida City Centre"),k(0)
  ],
  Red: [
    s("Rithala"),        k(1.6),
    s("Rohini West"),    k(1.4),
    s("Rohini East"),    k(1.5),
    s("Pitampura"),      k(1.6),
    s("Kohat Enclave"),  k(1.6),
    s("Netaji Subhash Place"),k(2.0),
    s("Keshav Puram"),   k(1.7),
    s("Kanhaiya Nagar"), k(1.5),
    s("Inderlok"),       k(1.9),
    s("Shastri Nagar"),  k(1.7),
    s("Pratap Nagar"),   k(1.4),
    s("Pul Bangash"),    k(1.3),
    s("Tis Hazari"),     k(1.5),
    s("Kashmere Gate"),  k(1.8),
    s("Shastri Park"),   k(1.7),
    s("Seelampur"),      k(1.6),
    s("Welcome"),        k(1.5),
    s("Shahdara"),       k(1.6),
    s("Mansarovar Park"),k(1.8),
    s("New Bus Adda"),   k(0)
  ],
  Green: [
    s("Kirti Nagar"),    k(2.3),
    s("Satguru Ram Singh Marg"),k(1.5),
    s("Ashok Park Main"),k(1.8),
    s("Punjabi Bagh"),   k(1.7),
    s("Shivaji Park"),   k(1.3),
    s("Madipur"),        k(1.7),
    s("Paschim Vihar East"),k(1.1),
    s("Paschim Vihar West"),k(1.4),
    s("Udyog Nagar"),    k(1.5),
    s("Peera Garhi"),    k(1.7),
    s("Nangloi"),        k(1.4),
    s("Nangloi Rly Stn"),k(1.3),
    s("Rajdhani Park"),  k(1.5),
    s("Mundka"),         k(1.8),
    s("Mundka Industrial Area"),k(2.0),
    s("Ghevra"),         k(2.2),
    s("Tikri Kalan"),    k(2.0),
    s("Tikri Border"),   k(2.3),
    s("Pandit Shree Ram Sharma"),k(2.0),
    s("Brigadier Hoshiar Singh"),k(0)
  ],
  Violet: [
    s("Kashmere Gate"),  k(1.7),
    s("Lal Qila"),       k(1.0),
    s("Jama Masjid"),    k(1.2),
    s("Delhi Gate"),     k(1.6),
    s("ITO"),            k(1.0),
    s("Mandi House"),    k(1.3),
    s("Janpath"),        k(1.3),
    s("Central Secretariat"),k(1.5),
    s("Khan Market"),    k(1.7),
    s("Jawaharlal Nehru Stadium"),k(1.6),
    s("Lajpat Nagar"),   k(1.5),
    s("Moolchand"),      k(1.6),
    s("Kailash Colony"), k(1.2),
    s("Nehru Place"),    k(1.1),
    s("Kalkaji Mandir"), k(1.0),
    s("Govindpuri"),     k(1.5),
    s("Okhla"),          k(1.5),
    s("Jasola–Apollo"),  k(1.6),
    s("Sarita Vihar"),   k(1.9),
    s("Badarpur Border"),k(0)
  ],
  Magenta: [
    s("Janakpuri West"), k(1.6),
    s("Dabri Mor"),      k(1.2),
    s("Dashrath Puri"),  k(1.1),
    s("Palam"),          k(1.7),
    s("Sadar Bazaar Cantt"),k(1.5),
    s("Terminal 1–IGI Airport"),k(2.0),
    s("Vasant Vihar"),   k(1.5),
    s("Munirka"),        k(1.6),
    s("RK Puram"),       k(1.4),
    s("IIT Delhi"),      k(1.2),
    s("Hauz Khas"),      k(1.4),
    s("Panchsheel Park"),k(1.4),
    s("Chirag Delhi"),   k(1.2),
    s("Greater Kailash"),k(1.4),
    s("Nehru Enclave"),  k(1.1),
    s("Kalkaji Mandir"), k(1.7),
    s("Okhla NSIC"),     k(1.3),
    s("Sukhdev Vihar"),  k(1.4),
    s("Okhla Bird Sanctuary"),k(1.6),
    s("Botanical Garden"),k(0)
  ],
  Pink: [
    s("Majlis Park"),    k(1.5),
    s("Azadpur"),        k(1.4),
    s("Shalimar Bagh"),  k(1.6),
    s("Netaji Subhash Place"),k(2.0),
    s("Shakurpur"),      k(1.4),
    s("Punjabi Bagh West"),k(2.0),
    s("ESI Basai Darapur"),k(1.5),
    s("Rajouri Garden"), k(2.5),
    s("Maya Puri"),      k(1.7),
    s("Naraina Vihar"),  k(1.6),
    s("Delhi Cantt"),    k(2.0),
    s("Durgabai Deshmukh South Campus"),k(2.2),
    s("Sir Vishweshwaraiah Moti Bagh"),k(1.7),
    s("Bhikaji Cama Place"),k(1.4),
    s("Sarojini Nagar"), k(1.3),
    s("INA"),            k(1.1),
    s("South Extension"),k(1.2),
    s("Lajpat Nagar"),   k(1.5),
    s("Vinobapuri"),     k(1.4),
    s("Mayur Vihar Pocket–1"),k(0)
  ],
  Grey: [
    s("Dwarka"),         k(2.2),
    s("Nangli"),         k(2.1),
    s("Najafgarh"),      k(2.2),
    s("Dhansa Bus Stand"),k(0)
  ],
  Airport: [
    s("New Delhi"),      k(2.1),
    s("Shivaji Stadium"),k(3.0),
    s("Dhaula Kuan"),    k(3.6),
    s("Delhi Aerocity"), k(3.2),
    s("IGI Airport T3"), k(3.0),
    s("Dwarka Sector 21"),k(0)
  ],
  Aqua: [
    s("Sector 51"),      k(1.1),
    s("Sector 50"),      k(1.0),
    s("Sector 76"),      k(1.2),
    s("Sector 101"),     k(1.3),
    s("Sector 81"),      k(1.2),
    s("NSEZ"),           k(1.4),
    s("Sector 83"),      k(1.2),
    s("Sector 137"),     k(1.5),
    s("Sector 142"),     k(1.8),
    s("Sector 143"),     k(1.2),
    s("Sector 144"),     k(1.3),
    s("Sector 145"),     k(1.2),
    s("Sector 146"),     k(1.4),
    s("Sector 147"),     k(1.4),
    s("Sector 148"),     k(1.7),
    s("Knowledge Park II"),k(0)
  ]
};

// Helpers to define station & km
function s(name){ return { name }; }
function k(km){ return { kmToNext: km }; }

// Build nodes & edges (graph)
const nodes = new Map(); // key: StationName__Line  -> { key,name,line }
const edges = new Map(); // key: fromKey -> [{toKey,dist,line}]

// Create line edges (adjacent stations)
for (const [line, arr] of Object.entries(LINES)) {
  const stations = [];
  for (let i=0; i<arr.length; i+=2) {
    const st = arr[i], meta = arr[i+1] || { kmToNext: 0 };
    stations.push({ name: st.name, kmToNext: meta.kmToNext ?? 0 });
  }
  for (let i=0;i<stations.length;i++){
    const key = nodeKey(stations[i].name, line);
    ensureNode(key, stations[i].name, line);
    if (i < stations.length-1){
      const nextKey = nodeKey(stations[i+1].name, line);
      ensureNode(nextKey, stations[i+1].name, line);
      // undirected edge with distance
      addEdge(key, nextKey, stations[i].kmToNext, line);
      addEdge(nextKey, key, stations[i].kmToNext, line);
    }
  }
}

// Create zero-distance interchange edges across lines (same name)
const nameToKeys = new Map();
for (const key of nodes.keys()){
  const { name } = nodes.get(key);
  if (!nameToKeys.has(name)) nameToKeys.set(name, []);
  nameToKeys.get(name).push(key);
}
for (const keys of nameToKeys.values()){
  if (keys.length > 1){
    for (let i=0;i<keys.length;i++){
      for (let j=i+1;j<keys.length;j++){
        addEdge(keys[i], keys[j], 0, "Interchange");
        addEdge(keys[j], keys[i], 0, "Interchange");
      }
    }
  }
}

// Fare calculation
function fareForDistance(km){
  if (km <= 2) return 10;
  if (km <= 5) return 20;
  if (km <= 12) return 30;
  if (km <= 21) return 40;
  if (km <= 32) return 50;
  return 60;
}

// Dijkstra shortest path by distance
function shortestPath(fromName, toName){
  // From/To may exist on multiple lines; consider all and pick best
  const fromKeys = nameToKeys.get(fromName) || [];
  const toKeys   = nameToKeys.get(toName) || [];
  if (!fromKeys.length || !toKeys.length) return null;

  let best = null;
  for (const fk of fromKeys){
    const res = dijkstra(fk, new Set(toKeys));
    if (res && (!best || res.dist < best.dist)) best = res;
  }
  return best;
}

function dijkstra(startKey, targetKeys){
  const dist = new Map(); const prev = new Map();
  const visited = new Set();

  for (const k of nodes.keys()) dist.set(k, Infinity);
  dist.set(startKey, 0);

  const pq = new MinPQ();
  pq.push({ key: startKey, d: 0 });

  while (!pq.empty()){
    const { key, d } = pq.pop();
    if (visited.has(key)) continue;
    visited.add(key);

    if (targetKeys.has(key)){
      // reconstruct path
      const path = [];
      let cur = key;
      while (cur){
        path.push(cur);
        cur = prev.get(cur);
      }
      path.reverse();
      return { dist: d, path };
    }

    const nbrs = edges.get(key) || [];
    for (const { toKey, dist: w } of nbrs){
      const nd = d + w;
      if (nd < dist.get(toKey)){
        dist.set(toKey, nd);
        prev.set(toKey, key);
        pq.push({ key: toKey, d: nd });
      }
    }
  }
  return null;
}

// Priority queue (min-heap) by 'd'
class MinPQ{
  constructor(){ this.a=[]; }
  push(x){ this.a.push(x); this._up(this.a.length-1); }
  pop(){
    const a=this.a; if(!a.length) return null;
    const top=a[0], last=a.pop(); if(a.length){ a[0]=last; this._down(0); }
    return top;
  }
  empty(){ return this.a.length===0; }
  _up(i){
    const a=this.a;
    while(i){
      const p=(i-1)>>1;
      if(a[p].d<=a[i].d) break;
      [a[p],a[i]]=[a[i],a[p]]; i=p;
    }
  }
  _down(i){
    const a=this.a, n=a.length;
    while(true){
      let l=i*2+1, r=l+1, m=i;
      if(l<n && a[l].d<a[m].d) m=l;
      if(r<n && a[r].d<a[m].d) m=r;
      if(m===i) break;
      [a[m],a[i]]=[a[i],a[m]]; i=m;
    }
  }
}

function nodeKey(name, line){ return `${name}__${line}`; }
function ensureNode(key, name, line){
  if (!nodes.has(key)) nodes.set(key, { key, name, line });
  if (!edges.has(key)) edges.set(key, []);
}
function addEdge(fromKey, toKey, dist, line){
  if (!edges.has(fromKey)) edges.set(fromKey, []);
  edges.get(fromKey).push({ toKey, dist, line });
}

// Populate dropdowns
function populateSelects(){
  const fromSel = document.getElementById("from");
  const toSel   = document.getElementById("to");
  const names = Array.from(nameToKeys.keys()).sort();
  for (const n of names){
    const o1=document.createElement("option");
    const o2=document.createElement("option");
    o1.value=o2.value=n; o1.text=o2.text=n;
    fromSel.add(o1); toSel.add(o2);
  }
}

// Render route steps
function renderRoute(result){
  const summary = document.getElementById("summary");
  const stepsEl = document.getElementById("steps");
  stepsEl.innerHTML = "";

  if (!result){
    summary.textContent = "No route found between selected stations.";
    return;
  }

  // Build human steps with line segments & interchanges
  const hops = [];
  for (let i=0;i<result.path.length-1;i++){
    const a = nodes.get(result.path[i]);
    const b = nodes.get(result.path[i+1]);
    // find edge to know whether this hop is interchange (0km) or travel on a line
    const e = (edges.get(a.key) || []).find(x=>x.toKey===b.key);
    const km = e ? e.dist : 0;
    hops.push({ from: a, to: b, km, line: e ? (e.line==="Interchange" ? null : a.line) : a.line });
  }

  // Group into contiguous line segments
  const segments = [];
  let cur = null;
  for (const h of hops){
    if (h.km === 0){ // interchange
      if (cur) segments.push(cur);
      segments.push({ interchange: true, at: h.from.name, toLine: h.to.line });
      cur = null;
      continue;
    }
    if (!cur) cur = { line: h.line, from: h.from.name, to: h.to.name, km: h.km };
    else if (cur.line === h.line){ cur.to = h.to.name; cur.km += h.km; }
    else { segments.push(cur); cur = { line: h.line, from: h.from.name, to: h.to.name, km: h.km }; }
  }
  if (cur) segments.push(cur);

  const totalKm = result.dist;
  const fare = fareForDistance(totalKm);

  summary.innerHTML = `<strong>Total Distance:</strong> ${totalKm.toFixed(1)} km
    &nbsp;|&nbsp; <strong>Fare:</strong> ₹${fare}`;

  for (const seg of segments){
    if (seg.interchange){
      const li = document.createElement("li");
      li.innerHTML = `<span class="step-line interchange">Interchange at <strong>${seg.at}</strong> → <em>${seg.toLine}</em> Line</span>`;
      stepsEl.appendChild(li);
    } else {
      const color = LINE_COLORS[seg.line] || "#000";
      const li = document.createElement("li");
      li.innerHTML = `<span class="step-line" style="border-color:${color}">
        <span class="dot" style="background:${color}"></span>
        <strong>${seg.line}</strong>: ${seg.from} → ${seg.to}
        &nbsp;(${seg.km.toFixed(1)} km)
      </span>`;
      stepsEl.appendChild(li);
    }
  }
}

// Init
window.addEventListener("DOMContentLoaded", ()=>{
  renderLegend();
  populateSelects();

  const form = document.getElementById("routeForm");
  form.addEventListener("submit", (e)=>{
    e.preventDefault();
    const from = document.getElementById("from").value;
    const to   = document.getElementById("to").value;
    if (!from || !to){ return; }
    if (from === to){
      document.getElementById("summary").textContent = "Same station selected. Fare: ₹10";
      document.getElementById("steps").innerHTML = "";
      return;
    }
    const res = shortestPath(from, to);
    renderRoute(res);
  });
});