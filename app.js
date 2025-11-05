// config
const ROOT_HEALTH_URL = "https://app.roothealth.app"; // change later if needed
const STORAGE_KEY = "rootHealthDiagnostic";

// bigger set of body systems / organs
const SYSTEMS = [
  { id: "cardio", label: "Heart / Cardio" },
  { id: "respiratory", label: "Respiratory" },
  { id: "digestive", label: "Digestive / Bowels" },
  { id: "liver", label: "Liver / Gallbladder" },
  { id: "kidneys", label: "Kidneys / Urinary" },
  { id: "reproductive", label: "Reproductive" },
  { id: "endocrine", label: "Endocrine" },
  { id: "excretory", label: "Excretory / Skin" },
  { id: "msk", label: "Musculoskeletal" },
  { id: "circulatory", label: "Circulatory" }
];

// layers as before
const LAYERS = [
  { id: "muscle", label: "Muscle" },
  { id: "nerve", label: "Nerves" },
  { id: "vessel", label: "Vessels" },
  { id: "epidermis", label: "Skin – Epidermis" },
  { id: "dermis", label: "Skin – Dermis" },
];

// more sensations
const SYMPTOMS = [
  { id: "pain", label: "Pain" },
  { id: "tight", label: "Tension/Tightness" },
  { id: "itch", label: "Itch / Rash" },
  { id: "numb", label: "Tingling/Numbness" },
  { id: "burning", label: "Burning" },
  { id: "fatigue", label: "Fatigue/Heaviness" },
  { id: "bloat", label: "Bloating" }
];

const DURATIONS = [
  { id: "days", label: "Days" },
  { id: "weeks", label: "Weeks" },
  { id: "months", label: "Months" },
  { id: "years", label: "Years" },
];

const INTENSITIES = [1,2,3,4,5,6,7,8,9,10];

// instead of a tiny RULES object, let's use templates
const SYSTEM_THEMES = {
  "cardio": {
    title: "Heart / circulation often echoes pressure, grief, or performance anxiety.",
    factors: ["Shallow breathing", "Sedentary time", "Emotional holding in chest"],
    actions: ["3–5 mins coherent breathing", "Gentle walk", "Connect with a safe person"]
  },
  "respiratory": {
    title: "Respiratory patterns mirror how much space you allow yourself.",
    factors: ["Mouth breathing", "Indoor air", "Stress peaks"],
    actions: ["Nasal low-and-slow breathing", "Fresh air break", "Reduce stimulants"]
  },
  "digestive": {
    title: "Digestive signals often appear when you're ‘not digesting’ life input.",
    factors: ["Eating on the go", "Highly processed foods", "Stress while eating"],
    actions: ["Screen-free meals", "Chew 10+ times", "5-min post-meal walk"]
  },
  "liver": {
    title: "Liver/gallbladder can show up with irritation or decision fatigue.",
    factors: ["Late heavy meals", "Alcohol/fats load", "Unmade decisions"],
    actions: ["Earlier lighter dinner", "Hydrate on waking", "Do 1 pending decision"]
  },
  "kidneys": {
    title: "Kidney/urinary themes can mirror safety and fluid balance.",
    factors: ["Low hydration", "High stress", "Holding patterns"],
    actions: ["Hydrate through day", "2-min relaxation", "Reduce stimulants"]
  },
  "reproductive": {
    title: "Reproductive area often ties to intimacy, creation, and safety.",
    factors: ["Pelvic tension", "Hormonal shifts", "Boundary stress"],
    actions: ["Pelvic floor relaxation", "Warmth to area", "Name one boundary"]
  },
  "endocrine": {
    title: "Endocrine signals can reflect long-term load vs. recovery.",
    factors: ["Sleep debt", "Blood sugar swings", "Chronic stressors"],
    actions: ["Earlier bedtime", "Balanced meals", "1 stress relief ritual"]
  },
  "excretory": {
    title: "Excretory/skin reactions often speak to boundaries & elimination.",
    factors: ["Irritants/detergents", "Inflammatory foods", "Heat/sweat friction"],
    actions: ["Cool rinse", "Gentle moisturiser", "Reinforce 1 boundary today"]
  },
  "msk": {
    title: "Muscles/joints speak in the language of load, posture, and support.",
    factors: ["Prolonged sitting", "One-sided load", "Weak glutes/core"],
    actions: ["Hip flexor stretch", "Glute activation", "Ask for small help"]
  },
  "circulatory": {
    title: "Circulatory issues can map to movement scarcity & stress tone.",
    factors: ["Low daily steps", "Tight clothing", "High stress"],
    actions: ["5-min walk", "Loosen clothing", "Breathing break"]
  },
  "default": {
    title: "Your body is signalling a stress or adaptation pattern.",
    factors: ["Sleep", "Hydration", "Movement"],
    actions: ["3-min breathing", "Glass of water", "Gentle stretch"]
  }
};

let state = {
  region: null,     // where the dot was
  system: null,     // body system
  layer: null,
  symptom: null,
  duration: "weeks",
  intensity: 5,
};

function $(id){ return document.getElementById(id); }

function makeChips(containerId, items, onSelect, selectedId){
  const el = $(containerId);
  el.innerHTML = items.map(i => `
    <button class="chip ${i.id === selectedId ? "active" : ""}" data-id="${i.id}">${i.label}</button>
  `).join("");
  el.onclick = (e) => {
    const btn = e.target.closest(".chip"); if (!btn) return;
    const id = btn.dataset.id;
    [...el.children].forEach(c => c.classList.remove("active"));
    btn.classList.add("active");
    onSelect(id);
  };
}

// make hotspot draggable
function makeHotspotDraggable(hotspot, container){
  let dragging = false;
  let startX = 0, startY = 0;

  const start = (e) => {
    dragging = true;
    const evt = e.touches ? e.touches[0] : e;
    startX = evt.clientX;
    startY = evt.clientY;
    hotspot.style.transition = "none";
    e.preventDefault();
  };

  const move = (e) => {
    if (!dragging) return;
    const rect = container.getBoundingClientRect();
    const evt = e.touches ? e.touches[0] : e;
    const x = evt.clientX - rect.left;
    const y = evt.clientY - rect.top;
    // convert to %
    const leftPct = (x / rect.width) * 100;
    const topPct = (y / rect.height) * 100;
    hotspot.style.left = leftPct + "%";
    hotspot.style.top = topPct + "%";
  };

  const end = () => {
    dragging = false;
    hotspot.style.transition = ""; // restore
  };

  hotspot.addEventListener("mousedown", start);
  hotspot.addEventListener("touchstart", start, {passive:false});
  window.addEventListener("mousemove", move);
  window.addEventListener("touchmove", move, {passive:false});
  window.addEventListener("mouseup", end);
  window.addEventListener("touchend", end);
}

document.addEventListener("DOMContentLoaded", () => {
  // hotspots
  const bodyImage = document.getElementById("bodyImage");
  document.querySelectorAll(".hotspot").forEach(h => {
    // make draggable
    makeHotspotDraggable(h, bodyImage);

    // select on click (but ignore drag-ish)
    h.addEventListener("click", () => {
      document.querySelectorAll(".hotspot").forEach(x => x.classList.remove("active"));
      h.classList.add("active");
      state.region = h.dataset.region;
      $("selected").textContent = state.region;
    });
  });

  // chips
  makeChips("systemChips", SYSTEMS, id => state.system = id);
  makeChips("layerChips", LAYERS, id => state.layer = id);
  makeChips("symptomChips", SYMPTOMS, id => state.symptom = id);
  makeChips("durationChips", DURATIONS, id => state.duration = id, "weeks");
  makeChips("intensityChips", INTENSITIES.map(n => ({id:String(n), label:String(n)})), id => state.intensity = Number(id), "5");

  // zoom
  const zoomInput = document.getElementById("zoom");
  if (zoomInput && bodyImage) {
    zoomInput.addEventListener("input", () => {
      const scale = Number(zoomInput.value) / 100;
      bodyImage.style.transform = `scale(${scale})`;
    });
  }

  // analyze
  $("analyze").addEventListener("click", () => {
    const sys = state.system || "default";
    const theme = SYSTEM_THEMES[sys] || SYSTEM_THEMES["default"];
    const sensationText = state.symptom ? `Sensation: ${state.symptom}.` : "";
    const durationText = `Duration: ${state.duration}.`;
    const intensityText = `Intensity ${state.intensity}/10.`;

    $("summary").textContent =
      `${theme.title} ${sensationText} ${durationText} ${intensityText}`;

    $("factors").innerHTML = (theme.factors || []).map(f => `<li>${f}</li>`).join("");
    $("actions").innerHTML = (theme.actions || []).map(a => `<li>${a}</li>`).join("");

    $("result").style.display = "block";

    // save to localStorage
    const payload = {
      input: state,
      insight: {
        title: theme.title,
        factors: theme.factors,
        actions: theme.actions
      },
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  });
});
