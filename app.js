// Multi-dot glass diagnostic with detailed refinement + manual region override
// NOTE: Lifestyle / load mapping only, not medical advice.

const glassImage = document.getElementById("glass-image");
const markerLayer = document.getElementById("marker-layer");
const areasList = document.getElementById("areas-list");
const summaryBox = document.getElementById("summary-text");
const clearBtn = document.getElementById("clear-btn");
const detailPanel = document.getElementById("detail-panel");
const detailOptionsEl = document.getElementById("detail-options");
const detailHintEl = document.getElementById("detail-hint");

const markers = [];
let activeMarker = null;

// For the region override pills:
const REGION_DEFS = [
  { id: "head", label: "Head / brain / face" },
  { id: "neck_shoulders", label: "Neck & shoulders" },
  { id: "chest", label: "Chest / upper ribs" },
  { id: "upper_abdomen", label: "Upper abdomen" },
  { id: "lower_abdomen_pelvis", label: "Lower abdomen / pelvis" },
  { id: "knees", label: "Knees" },
  { id: "lower_legs_feet", label: "Lower legs / feet" }
];

// 1) Region classifier: from click → broad region + side
// Tweaked so heart stays in CHEST and intestines land in LOWER ABDOMEN / PELVIS,
// but user can override region manually if needed.
function classifyRegion(xPercent, yPercent) {
  let side;
  if (xPercent < 0.33) side = "left";
  else if (xPercent > 0.67) side = "right";
  else side = "central";

  let regionId;
  let regionLabel;

  if (yPercent < 0.16) {
    // Very top of the body
    regionId = "head";
    regionLabel = "Head / brain / face";
  } else if (yPercent < 0.25) {
    // Thin neck/shoulder band
    regionId = "neck_shoulders";
    regionLabel = "Neck & shoulders";
  } else if (yPercent < 0.38) {
    // Chest band (heart, lungs, sternum, ribs, breasts)
    regionId = "chest";
    regionLabel = "Chest / upper ribs";
  } else if (yPercent < 0.52) {
    // Upper abdomen (stomach, liver/gallbladder, pancreas, diaphragm)
    regionId = "upper_abdomen";
    regionLabel = "Upper abdomen";
  } else if (yPercent < 0.66) {
    // Lower abdomen / pelvis (bowels/IBS, general gut, bladder, reproductive)
    regionId = "lower_abdomen_pelvis";
    regionLabel = "Lower abdomen / pelvis";
  } else if (yPercent < 0.82) {
    regionId = "knees";
    regionLabel = "Knees";
  } else {
    regionId = "lower_legs_feet";
    regionLabel = "Lower legs / ankles / feet";
  }

  return { regionId, regionLabel, side };
}

// 2) Options for a given region (the elimination list)

function getOptionsForRegion(regionId, side) {
  const sideWord =
    side === "left" ? "Left " : side === "right" ? "Right " : "Either ";

  switch (regionId) {
    case "head":
      return [
        {
          id: "headache_migraine",
          label: "Headache / migraine pain",
          tags: ["mind", "tension", "headache"]
        },
        {
          id: "jaw_tension",
          label: "Jaw / clenching / TMJ",
          tags: ["jaw", "tension", "stress"]
        },
        {
          id: "sinus_congestion",
          label: "Sinuses / facial pressure",
          tags: ["sinus", "inflammation"]
        },
        {
          id: "brain_fog",
          label: "Brain fog / overthinking",
          tags: ["mind", "overthinking", "fatigue"]
        }
      ];

    case "neck_shoulders":
      return [
        {
          id: "neck_muscles",
          label: "Neck muscles / tightness",
          tags: ["tension", "posture", "stress"]
        },
        {
          id: "upper_traps",
          label: "Top of shoulders / upper traps",
          tags: ["tension", "load", "stress"]
        },
        {
          id: "throat_area",
          label: "Front of neck / throat area",
          tags: ["throat", "stress"]
        },
        {
          id: "collarbone",
          label: "Collarbone / upper chest edge",
          tags: ["posture", "bones"]
        }
      ];

    case "chest":
      return [
        {
          id: "heart_centre",
          label: "Heart area / centre of chest",
          tags: ["heart", "cardio", "chest"]
        },
        {
          id: "lung_side",
          label: `${sideWord}lung / side of chest`,
          tags: ["lungs", "respiratory", "chest"]
        },
        {
          id: "breast_tissue",
          label: `${sideWord}chest / breast tissue`,
          tags: ["breast", "chest"]
        },
        {
          id: "sternum",
          label: "Sternum / front of rib cage",
          tags: ["bones", "chest"]
        },
        {
          id: "ribs_front",
          label: "Ribs (front)",
          tags: ["ribs", "chest"]
        },
        {
          id: "shoulder_blades",
          label: `${sideWord}shoulder blade / upper back`,
          tags: ["upper_back", "posture", "tension"]
        }
      ];

    case "upper_abdomen":
      return [
        {
          id: "stomach_upper",
          label: "Stomach / upper abdomen (acid, nausea, reflux)",
          tags: ["stomach", "gut", "digestion"]
        },
        {
          id: "liver_gallbladder",
          label: `${side === "right" ? "Right " : ""}liver / gallbladder area`,
          tags: ["liver", "gallbladder", "digestion"]
        },
        {
          id: "pancreas_central",
          label: "Pancreas area / central upper abdomen",
          tags: ["pancreas", "metabolism", "digestion"]
        },
        {
          id: "diaphragm_solar",
          label: "Diaphragm / solar plexus tightness",
          tags: ["breathing", "stress", "diaphragm"]
        }
      ];

    case "lower_abdomen_pelvis":
      return [
        {
          id: "colon_ibs",
          label: "Colon / bowels (IBS-type cramps, urgency or bloating)",
          tags: ["gut", "colon", "ibs", "digestion"]
        },
        {
          id: "general_gut",
          label: "General gut / bloating / cramping",
          tags: ["gut", "digestion"]
        },
        {
          id: "bladder",
          label: "Bladder / urinary discomfort",
          tags: ["bladder", "pelvis"]
        },
        {
          id: "reproductive_organs",
          label: `${sideWord}reproductive organs (period pain, pelvic load)`,
          tags: ["reproductive", "pelvis", "hormones"]
        }
      ];

    case "knees":
      return [
        {
          id: "kneecap_front",
          label: `${sideWord}front of knee / kneecap`,
          tags: ["joints", "knees", "impact"]
        },
        {
          id: "knee_inside",
          label: `${sideWord}inside of knee joint`,
          tags: ["joints", "knees", "ligaments"]
        },
        {
          id: "knee_outside",
          label: `${sideWord}outside of knee joint`,
          tags: ["joints", "knees", "tendons"]
        },
        {
          id: "knee_back",
          label: `${sideWord}back of knee`,
          tags: ["joints", "knees"]
        }
      ];

    case "lower_legs_feet":
      return [
        {
          id: "calves",
          label: `${sideWord}calf muscles`,
          tags: ["muscles", "load", "legs"]
        },
        {
          id: "shins",
          label: `${sideWord}shins / front of legs`,
          tags: ["muscles", "impact", "legs"]
        },
        {
          id: "ankles",
          label: `${sideWord}ankle joint`,
          tags: ["joints", "ankles", "balance"]
        },
        {
          id: "feet_arches",
          label: `${sideWord}foot arches / plantar surface`,
          tags: ["feet", "support", "gait"]
        }
      ];

    default:
      return [
        {
          id: "general_area",
          label: "General load in this area",
          tags: ["mixed"]
        }
      ];
  }
}

// 3) Marker management

function addMarker(xPercent, yPercent) {
  const { regionId, regionLabel, side } = classifyRegion(xPercent, yPercent);
  const options = getOptionsForRegion(regionId, side);

  const markerEl = document.createElement("div");
  markerEl.className = "marker";
  markerEl.style.left = `${xPercent * 100}%`;
  markerEl.style.top = `${yPercent * 100}%`;

  const markerObj = {
    xPercent,
    yPercent,
    regionId,
    regionLabel,
    side,
    options, // all possible structures
    selectedOptionIds: options.map((o) => o.id), // start with ALL selected -> user eliminates
    el: markerEl
  };

  markerEl.addEventListener("click", (e) => {
    e.stopPropagation();
    setActiveMarker(markerObj);
  });

  markerLayer.appendChild(markerEl);
  markers.push(markerObj);
  setActiveMarker(markerObj); // new marker becomes active
  renderMarkers();
}

function removeMarker(markerObj) {
  const index = markers.indexOf(markerObj);
  if (index !== -1) {
    markers.splice(index, 1);
  }
  if (markerObj.el && markerObj.el.parentNode) {
    markerObj.el.parentNode.removeChild(markerObj.el);
  }

  if (activeMarker === markerObj) {
    activeMarker = markers.length ? markers[markers.length - 1] : null;
  }

  renderMarkers();
}

function clearMarkers() {
  markers.splice(0, markers.length);
  while (markerLayer.firstChild) {
    markerLayer.removeChild(markerLayer.firstChild);
  }
  activeMarker = null;
  renderMarkers();
}

function setActiveMarker(markerObj) {
  activeMarker = markerObj;
  renderMarkers();
}

// 4) Rendering: list, detail options, region override, summary

function renderMarkers() {
  // Selected areas list
  areasList.innerHTML = "";

  markers.forEach((m, idx) => {
    const li = document.createElement("li");
    li.className = "area-item";

    const info = document.createElement("div");
    const title = document.createElement("div");
    title.className = "area-label";

    const selectedLabels = m.options
      .filter((o) => m.selectedOptionIds.includes(o.id))
      .map((o) => o.label);

    const labelText =
      selectedLabels.length > 0
        ? selectedLabels.join(", ")
        : m.regionLabel + " (no specific structures selected)";

    title.textContent = `${idx + 1}. ${labelText}`;

    const meta = document.createElement("div");
    meta.className = "area-meta";
    meta.textContent = `${m.regionLabel} · X: ${(m.xPercent * 100).toFixed(
      0
    )}%, Y: ${(m.yPercent * 100).toFixed(0)}%`;

    info.appendChild(title);
    info.appendChild(meta);

    const removeBtn = document.createElement("button");
    removeBtn.className = "area-remove";
    removeBtn.type = "button";
    removeBtn.textContent = "×";
    removeBtn.title = "Remove this dot";
    removeBtn.addEventListener("click", () => removeMarker(m));

    li.appendChild(info);
    li.appendChild(removeBtn);

    li.addEventListener("click", () => {
      setActiveMarker(m);
    });

    areasList.appendChild(li);
  });

  renderDetailPanel();
  renderSummary();
}

// Detail panel: region override + options for active marker

function renderDetailPanel() {
  if (!activeMarker) {
    detailOptionsEl.innerHTML = "";
    detailHintEl.textContent =
      "Click on the glass body to add a dot. Then remove the structures that don&apos;t fit until only the most accurate ones remain.";
    return;
  }

  detailOptionsEl.innerHTML = "";
  detailHintEl.innerHTML =
    "You&apos;re refining a dot in the area: <strong>" +
    activeMarker.regionLabel +
    "</strong>. If this doesn&apos;t match, choose another region below, then turn off structures that don&apos;t fit. At least one structure should remain.";

  // Region override bar
  const bar = document.createElement("div");
  bar.className = "detail-region-bar";

  REGION_DEFS.forEach((r) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "detail-region-btn";
    btn.textContent = r.label;

    if (r.id === activeMarker.regionId) {
      btn.classList.add("active");
    }

    btn.addEventListener("click", () => {
      overrideRegionForActiveMarker(r.id);
    });

    bar.appendChild(btn);
  });

  detailOptionsEl.appendChild(bar);

  // Structure options
  const optionsWrap = document.createElement("div");
  optionsWrap.className = "detail-options";

  activeMarker.options.forEach((opt) => {
    const optBtn = document.createElement("button");
    optBtn.type = "button";
    optBtn.className = "detail-option";
    optBtn.textContent = opt.label;

    if (activeMarker.selectedOptionIds.includes(opt.id)) {
      optBtn.classList.add("active");
    }

    optBtn.addEventListener("click", () => {
      toggleOptionForActiveMarker(opt.id);
    });

    optionsWrap.appendChild(optBtn);
  });

  detailOptionsEl.appendChild(optionsWrap);
}

function overrideRegionForActiveMarker(newRegionId) {
  if (!activeMarker) return;

  const def = REGION_DEFS.find((r) => r.id === newRegionId);
  if (!def) return;

  activeMarker.regionId = def.id;
  activeMarker.regionLabel = def.label;

  const newOptions = getOptionsForRegion(def.id, activeMarker.side);
  activeMarker.options = newOptions;
  activeMarker.selectedOptionIds = newOptions.map((o) => o.id);

  renderMarkers();
}

function toggleOptionForActiveMarker(optionId) {
  if (!activeMarker) return;

  const current = new Set(activeMarker.selectedOptionIds);

  if (current.has(optionId)) {
    // Don’t allow zero: must keep at least one selected
    if (current.size === 1) {
      return;
    }
    current.delete(optionId);
  } else {
    current.add(optionId);
  }

  activeMarker.selectedOptionIds = Array.from(current);
  renderMarkers();
}

// Summary: root-cause style themes

function renderSummary() {
  if (markers.length === 0) {
    summaryBox.innerHTML =
      "Tap on the glass human to begin. As you refine each dot, we&apos;ll highlight detailed themes (for example: IBS-type gut load, joint strain, stress-driven tension, or heart/chest workload).";
    return;
  }

  // Collect all chosen structures
  const chosenStructures = [];
  const tagCounts = {};

  markers.forEach((m) => {
    m.options
      .filter((o) => m.selectedOptionIds.includes(o.id))
      .forEach((opt) => {
        chosenStructures.push(opt.label);
        opt.tags.forEach((t) => {
          if (!tagCounts[t]) tagCounts[t] = 0;
          tagCounts[t] += 1;
        });
      });
  });

  const uniqueStructures = Array.from(new Set(chosenStructures));

  // Helper to check tags
  const hasAnyTag = (...tags) => tags.some((t) => tagCounts[t]);

  const themes = [];

  if (hasAnyTag("heart", "cardio")) {
    themes.push({
      title: "Heart and central chest workload",
      text:
        "You&apos;ve highlighted the heart / central chest area. Root Health can&apos;t replace medical assessment, but it can help you work on the lifestyle load around your heart: stress levels, sleep, movement, breathing patterns and long-term pacing. New, severe or worsening chest symptoms should always be checked by a doctor urgently."
    });
  }

  if (hasAnyTag("lungs", "respiratory", "breathing", "diaphragm")) {
    themes.push({
      title: "Breathing mechanics and respiratory load",
      text:
        "Dots around the lungs, ribs or diaphragm suggest that breathing mechanics, posture, fitness level or stress may be creating extra load. Inside Root Health you can use breathing tools, pacing strategies and gradual movement plans to support this system."
    });
  }

  if (
    hasAnyTag(
      "ibs",
      "colon",
      "gut",
      "digestion",
      "stomach",
      "liver",
      "gallbladder",
      "pancreas"
    )
  ) {
    themes.push({
      title: "Gut, digestion and IBS-type load",
      text:
        "Focus on the gut, bowels and upper abdomen often points to a mix of food triggers, stress, sleep, pacing and nervous system sensitivity. Root Health can help you track patterns (IBS flares, bloating, bowel changes), experiment with routines and support the gut–brain axis over time."
    });
  }

  if (
    hasAnyTag("joints", "knees", "ankles", "hips", "feet", "ribs", "bones")
  ) {
    themes.push({
      title: "Joints, impact and long-term load",
      text:
        "Joints and supporting structures (knees, ankles, hips, ribs) carry mechanical load. Repeated dots here suggest that load management, strength, movement patterns and rest windows all matter. Root Health can help you design pacing plans, movement experiments and recovery routines."
    });
  }

  if (hasAnyTag("tension", "upper_back", "posture", "jaw")) {
    themes.push({
      title: "Muscle tension, posture and stored stress",
      text:
        "Neck, shoulders, jaw and upper back markers point to how you hold stress and load in the body. With Root Health you can explore micro-breaks, relaxation tools, posture tweaks and routines that gradually reduce this background tension."
    });
  }

  if (hasAnyTag("mind", "overthinking", "headache", "fatigue")) {
    themes.push({
      title: "Mind, overthinking and nervous system load",
      text:
        "Markers linked to brain fog, overthinking or headaches suggest that your nervous system and mind are carrying a lot. Root Health can support you with stress coaches, wind-down routines, thought-unloading prompts and tracking what genuinely helps you settle over weeks and months."
    });
  }

  if (hasAnyTag("reproductive", "hormones", "pelvis")) {
    themes.push({
      title: "Pelvic and hormonal load",
      text:
        "Pelvic and reproductive markers often relate to hormonal cycles, chronic pelvic pain, or how stress and posture interact with these systems. Root Health can help you map symptoms against sleep, stress, movement and cycles, then build routines that respect those rhythms."
    });
  }

  if (hasAnyTag("feet", "support", "gait", "legs", "impact")) {
    themes.push({
      title: "Foundations, movement patterns and impact",
      text:
        "Feet, ankles and lower legs act as your foundations. Dots here can signal that footwear, surface, movement style and general conditioning are part of the picture. Root Health can support experiments around pacing, footwear, walking patterns and recovery."
    });
  }

  if (themes.length === 0) {
    themes.push({
      title: "Mixed pattern of load",
      text:
        "You&apos;ve highlighted a mix of structures. That&apos;s common. Root Health helps you pick a sensible starting point, then layer changes over time instead of trying to fix everything at once."
    });
  }

  let html = "";
  html += `<p>You&apos;ve identified these specific structures:</p>`;
  html += `<p><strong>${uniqueStructures.join(", ")}</strong></p>`;
  html += "<ul>";
  themes.forEach((t) => {
    html += `<li><strong>${t.title}:</strong> ${t.text}</li>`;
  });
  html += "</ul>";
  html +=
    "<p>This map is a starting point, not a diagnosis. Inside Root Health, you can turn these themes into assessments, coaching sessions, routines and journalling so you can track real change over time.</p>";

  summaryBox.innerHTML = html;
}

// 5) Event wiring

glassImage.addEventListener("click", (event) => {
  const rect = glassImage.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const xPercent = x / rect.width;
  const yPercent = y / rect.height;

  addMarker(xPercent, yPercent);
});

clearBtn.addEventListener("click", () => {
  clearMarkers();
});

// Initial render
renderMarkers();
