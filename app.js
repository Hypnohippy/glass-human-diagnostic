// config
const ROOT_HEALTH_URL = "https://app.roothealth.app"; // change later
const STORAGE_KEY = "rootHealthDiagnostic";

// UI sets
const LAYERS = [
  { id: "muscle", label: "Muscle" },
  { id: "nerve", label: "Nerves" },
  { id: "vessel", label: "Vessels" },
  { id: "epidermis", label: "Skin – Epidermis" },
  { id: "dermis", label: "Skin – Dermis" },
];
const SYMPTOMS = [
  { id: "pain", label: "Pain" },
  { id: "tight", label: "Tension/Tightness" },
  { id: "itch", label: "Itch" },
  { id: "numb", label: "Tingling/Numbness" },
];
const DURATIONS = [
  { id: "days", label: "Days" },
  { id: "weeks", label: "Weeks" },
  { id: "months", label: "Months" },
  { id: "years", label: "Years" },
];
const INTENSITIES = [1,2,3,4,5,6,7,8,9,10];

// very simple rules demo
const RULES = {
  "chest-muscle-pain": {
    summary: "Chest muscular tension often mirrors breath-holding and emotional pressure.",
  },
  "abdomen-dermis-itch": {
    summary: "Superficial abdominal irritation can pair with contact/boundary stress.",
  },
  "default": {
    summary: "Your body is signalling a stress pattern. Start with breath, hydration, and one honest boundary."
  }
};

let state = {
  region: null,
  layer: null,
  symptom: null,
  duration: "weeks",
  intensity: 5,
};

function $(id) { return document.getElementById(id); }

function makeChips(containerId, items, onSelect, selectedId) {
  const el = $(containerId);
  el.innerHTML = items.map(i => `
    <button class="chip ${i.id === selectedId ? "active":""}" data-id="${i.id}">${i.label}</button>
  `).join("");
  el.onclick = (e) => {
    const btn = e.target.closest(".chip");
    if (!btn) return;
    const id = btn.dataset.id;
    [...el.children].forEach(c => c.classList.remove("active"));
    btn.classList.add("active");
    onSelect(id);
  };
}

document.addEventListener("DOMContentLoaded", () => {
  // hotspots
  document.querySelectorAll(".hotspot").forEach(h => {
    h.addEventListener("click", () => {
      document.querySelectorAll(".hotspot").forEach(x => x.classList.remove("active"));
      h.classList.add("active");
      state.region = h.dataset.region;
      $("selected").textContent = state.region;
    });
  });

  makeChips("layerChips", LAYERS, id => state.layer = id);
  makeChips("symptomChips", SYMPTOMS, id => state.symptom = id);
  makeChips("durationChips", DURATIONS, id => state.duration = id, "weeks");
  makeChips("intensityChips", INTENSITIES.map(n => ({id:String(n), label:String(n)})), id => state.intensity = Number(id), "5");

  $("analyze").addEventListener("click", () => {
    const key = `${state.region || ""}-${state.layer || ""}-${state.symptom || ""}`;
    const rule = RULES[key] || RULES["default"];
    $("summary").textContent =
      rule.summary + ` · Intensity ${state.intensity}/10 · Duration: ${state.duration}.`;
    $("result").style.display = "block";

    // save locally
    const payload = {
      input: state,
      result: rule,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  });
});
