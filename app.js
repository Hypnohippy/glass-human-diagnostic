// ===== CONFIG =====
const ROOT_HEALTH_URL = "https://app.roothealth.app"; // change if needed
const STORAGE_KEY = "rootHealthDiagnostic";

// ===== DATA =====
const SYSTEMS = [
  { id: "cardio",      label: "Heart / Cardio" },
  { id: "respiratory", label: "Respiratory" },
  { id: "digestive",   label: "Digestive / Bowels" },
  { id: "liver",       label: "Liver / Gallbladder" },
  { id: "kidneys",     label: "Kidneys / Urinary" },
  { id: "reproductive",label: "Reproductive" },
  { id: "endocrine",   label: "Endocrine" },
  { id: "excretory",   label: "Excretory / Skin" },
  { id: "msk",         label: "Musculoskeletal" },
  { id: "circulatory", label: "Circulatory" }
];

const LAYERS = [
  { id: "muscle",    label: "Muscle" },
  { id: "nerve",     label: "Nerves" },
  { id: "vessel",    label: "Vessels" },
  { id: "epidermis", label: "Skin – Epidermis" },
  { id: "dermis",    label: "Skin – Dermis" },
];

const SYMPTOMS = [
  { id: "pain",    label: "Pain" },
  { id: "tight",   label: "Tension/Tightness" },
  { id: "itch",    label: "Itch / Rash" },
  { id: "numb",    label: "Tingling/Numbness" },
  { id: "burning", label: "Burning" },
  { id: "fatigue", label: "Fatigue/Heaviness" },
  { id: "bloat",   label: "Bloating" }
];

const DURATIONS = [
  { id: "days",   label: "Days" },
  { id: "weeks",  label: "Weeks" },
  { id: "months", label: "Months" },
  { id: "years",  label: "Years" },
];

const INTENSITIES = [1,2,3,4,5,6,7,8,9,10];

// ===== THEMES (stress/regen/association) =====
const SYSTEM_THEMES = {
  cardio: {
    title: "Heart/circulation often echoes pressure, grief, or performance demands.",
    stressPhase: "Stress/load phase: chest and heart area can tighten, breathing goes higher, and the body prioritises ‘go’ over ‘process’.",
    regenPhase: "Regeneration phase: the body wants deeper belly breaths, emotional release, and slower movement so circulation can normalise.",
    association: "Often shows up in people who hold things in, support everyone else, or feel watched/judged.",
    factors: ["Shallow or upper-chest breathing","Sedentary time","Unexpressed emotion"],
    actions: ["3–5 mins coherent breathing (5s in / 5s out)","Gentle outdoor walk","Name one feeling to a safe person"]
  },
  respiratory: {
    title: "Lungs mirror how much space you allow yourself to take.",
    stressPhase: "Stress/load phase: breath gets fast and high, ribs stay ‘on’, diaphragm moves less.",
    regenPhase: "Regeneration phase: slow nasal breathing, longer exhales, softer ribs.",
    association: "Linked to ‘I couldn’t speak up’ or ‘I had to keep it together’.",
    factors: ["Mouth breathing", "Indoor/stale air", "Frequent stress spikes"],
    actions: ["Box breathing 4·4·4·4", "Get fresh air", "Reduce stimulants today"]
  },
  digestive: {
    title: "Digestive signals often appear when you're asked to ‘swallow’ too much (food or life).",
    stressPhase: "Stress/load phase: blood is diverted away from digestion, motility changes, and sensitivity increases.",
    regenPhase: "Regeneration phase: calm, slow, warm meals in nervous-system safety.",
    association: "Common with boundary issues or ‘I can’t stomach this situation’.",
    factors: ["Eating on the go", "Ultra-processed foods", "Working/arguing while eating"],
    actions: ["Screen-free meals", "Chew 10+ times/bite", "5-min post-meal walk"]
  },
  liver: {
    title: "Liver/gallbladder often flags overload, irritation or decision fatigue.",
    stressPhase: "Stress/load phase: it keeps processing while more load comes in (late meals, alcohol, emotional irritation).",
    regenPhase: "Regeneration phase: wants lighter evenings, hydration, and emotional de-charge.",
    association: "Shows up in people who get stuck in frustration or take on others’ stuff.",
    factors: ["Late heavy dinners", "Alcohol/fat load", "Unfinished decisions"],
    actions: ["Earlier lighter dinner", "Hydrate on waking", "Park or finish 1 decision"]
  },
  kidneys: {
    title: "Kidney/urinary areas can mirror safety, fear and fluid balance.",
    stressPhase: "Stress/load phase: body may hold or dump fluids unpredictably depending on safety signals.",
    regenPhase: "Regeneration phase: wants steady hydration, warmth, actual support.",
    association: "Linked to ‘I have to hold it together’ or old fear imprints.",
    factors: ["Low hydration", "Cold/stressy environments", "Chronic over-responsibility"],
    actions: ["Sip water through day", "2-min relaxation scan", "Ask for a small piece of support"]
  },
  reproductive: {
    title: "Reproductive/pelvic signals tie to intimacy, creation and safety.",
    stressPhase: "Stress/load phase: pelvic floor over-holds, circulation reduces.",
    regenPhase: "Regeneration phase: wants softness, warmth, movement, emotional safety.",
    association: "Can follow boundary breaches or creating without support.",
    factors: ["Pelvic tension", "Hormonal load", "Relational stress"],
    actions: ["Pelvic floor relaxation breaths", "Gentle hip mobility", "Name one boundary"]
  },
  endocrine: {
    title: "Endocrine signs often mean ‘load > recovery’ for a while.",
    stressPhase: "Stress/load phase: body keeps you wired to get things done, stealing from rest and hormones.",
    regenPhase: "Regeneration phase: wants sleep, blood-sugar steadiness and fewer demands.",
    association: "Common in caregivers, high achievers, or people in long uncertainty.",
    factors: ["Sleep debt", "Skipping meals", "Chronic stressors"],
    actions: ["Earlier bedtime", "Balanced meals (protein + fibre)", "Schedule one true off-slot"]
  },
  excretory: {
    title: "Skin/excretory flare-ups often speak to boundaries and elimination.",
    stressPhase: "Stress/load phase: body may push out through the skin while you stay in the same irritating context.",
    regenPhase: "Regeneration phase: wants calmer products, less irritant input, and clearer boundaries.",
    association: "Often ‘I’m in contact with too much’ — people, products or emotions.",
    factors: ["Irritants/detergents", "Inflammatory foods", "Heat/sweat friction"],
    actions: ["Cool rinse", "Gentle moisturiser", "Say no once today"]
  },
  msk: {
    title: "Muscles/joints tell the story of load, posture and support.",
    stressPhase: "Stress/load phase: body braces (neck/back/jaw/hips) to hold on.",
    regenPhase: "Regeneration phase: wants length, breath and actual support from others.",
    association: "Shows up in people carrying a lot for others or sitting long hours.",
    factors: ["Prolonged sitting", "One-sided load", "Weak glutes/core"],
    actions: ["Hip-flexor stretch", "Glute activation", "Ask for small help"]
  },
  circulatory: {
    title: "Circulation can mirror low movement + high stress tone.",
    stressPhase: "Stress/load phase: vessels tighten and flow is less smooth.",
    regenPhase: "Regeneration phase: wants rhythmic movement and down-regulation.",
    association: "Often in high-brainers who forget about the body.",
    factors: ["Low daily steps", "Tight clothing", "High stress/coffee"],
    actions: ["5-min walk", "Loosen clothing", "Breathing break"]
  },
  default: {
    title: "Your body is signalling a stress → repair cycle.",
    stressPhase: "Stress/load phase: your system copes with current demands.",
    regenPhase: "Regeneration phase: it needs time, calm and good inputs to finish the repair.",
    association: "Often paired with long to-do lists and low recovery.",
    factors: ["Poor sleep", "Low hydration", "Low movement"],
    actions: ["3-min breathing", "Glass of water", "Gentle stretch"]
  }
};

// ===== STATE =====
let state = {
  region: null,
  system: null,
  layer: null,
  symptom: null,
  duration: "weeks",
  intensity: 5,
};

// ===== HELPERS =====
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

// turn x/y % into a label
function classifyRegion(xPct, yPct){
  // y = height from top
  if (yPct < 18) return "head";
  if (yPct < 26) return "neck";
  if (yPct < 40) {
    if (xPct < 43) return "left-shoulder";
    if (xPct > 57) return "right-shoulder";
    return "chest";
  }
  if (yPct < 54) {
    if (xPct < 45) return "left-abdomen";
    if (xPct > 55) return "right-abdomen";
    return "abdomen";
  }
  if (yPct < 70) return "pelvis";
  return "lower-body";
}

// make hotspot draggable and update region on drop
function makeHotspotDraggable(hotspot, container){
  let dragging = false;

  const start = (e) => {
    dragging = true;
    hotspot.style.transition = "none";
    e.preventDefault();
  };

  const move = (e) => {
    if (!dragging) return;
    const rect = container.getBoundingClientRect();
    const evt = e.touches ? e.touches[0] : e;
    const x = evt.clientX - rect.left;
    const y = evt.clientY - rect.top;
    const leftPct = (x / rect.width) * 100;
    const topPct  = (y / rect.height) * 100;
    hotspot.style.left = leftPct + "%";
    hotspot.style.top  = topPct + "%";
  };

  const end = (e) => {
    if (!dragging) return;
    dragging = false;
    hotspot.style.transition = "";

    // after drop, work out region
    const rect = container.getBoundingClientRect();
    const btnRect = hotspot.getBoundingClientRect();
    const x = (btnRect.left + btnRect.width/2) - rect.left;
    const y = (btnRect.top + btnRect.height/2) - rect.top;
    const xPct = (x / rect.width) * 100;
    const yPct = (y / rect.height) * 100;
    const region = classifyRegion(xPct, yPct);
    hotspot.dataset.region = region;
    state.region = region;
    $("selected").textContent = region;
  };

  hotspot.addEventListener("mousedown", start);
  hotspot.addEventListener("touchstart", start, { passive: false });
  window.addEventListener("mousemove", move);
  window.addEventListener("touchmove", move, { passive: false });
  window.addEventListener("mouseup", end);
  window.addEventListener("touchend", end);
}

// ===== MAIN =====
document.addEventListener("DOMContentLoaded", () => {
  const bodyImage = $("bodyImage");

  // hotspots
  document.querySelectorAll(".hotspot").forEach(h => {
    makeHotspotDraggable(h, bodyImage);
    h.addEventListener("click", () => {
      document.querySelectorAll(".hotspot").forEach(x => x.classList.remove("active"));
      h.classList.add("active");
      state.region = h.dataset.region;
      $("selected").textContent = state.region;
    });
  });

  // chips
  makeChips("systemChips", SYSTEMS, id => state.system = id);
  makeChips("layerChips",  LAYERS,  id => state.layer  = id);
  makeChips("symptomChips", SYMPTOMS, id => state.symptom = id);
  makeChips("durationChips", DURATIONS, id => state.duration = id, "weeks");
  makeChips("intensityChips",
    INTENSITIES.map(n => ({ id: String(n), label: String(n) })),
    id => state.intensity = Number(id),
    "5"
  );

  // zoom
  const zoomInput = $("zoom");
  if (zoomInput && bodyImage) {
    zoomInput.addEventListener("input", () => {
      const scale = Number(zoomInput.value) / 100;
      bodyImage.style.transform = `scale(${scale})`;
    });
  }

  // analyze
  $("analyze").addEventListener("click", () => {
    const sys   = state.system || "default";
    const theme = SYSTEM_THEMES[sys] || SYSTEM_THEMES["default"];

    const sensationText = state.symptom ? `Sensation: ${state.symptom}.` : "";
    const durationText  = `Duration: ${state.duration}.`;
    const intensityText = `Intensity ${state.intensity}/10.`;

    const summaryText = [
      theme.title,
      theme.stressPhase,
      theme.regenPhase,
      `Association: ${theme.association}`,
      sensationText,
      durationText,
      intensityText,
      "Your body isn’t failing — it’s trying to complete this cycle. Let’s help it finish."
    ].filter(Boolean).join(" ");

    $("summary").textContent = summaryText;
    $("factors").innerHTML = (theme.factors || []).map(f => `<li>${f}</li>`).join("");
    $("actions").innerHTML = (theme.actions || []).map(a => `<li>${a}</li>`).join("");

    $("result").style.display = "block";

    const payload = {
      input: { ...state },
      insight: {
        system: sys,
        title: theme.title,
        stressPhase: theme.stressPhase,
        regenPhase: theme.regenPhase,
        association: theme.association,
        factors: theme.factors,
        actions: theme.actions,
        symptom: state.symptom,
        duration: state.duration,
        intensity: state.intensity,
        region: state.region
      },
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  });

  // CTA → Root Health
  const continueBtn = document.getElementById("continueBtn");
  if (continueBtn) {
    continueBtn.addEventListener("click", () => {
      const saved = localStorage.getItem(STORAGE_KEY) || "{}";
      const encoded = encodeURIComponent(saved);
      window.location.href = `${ROOT_HEALTH_URL}?data=${encoded}`;
    });
  }
});
