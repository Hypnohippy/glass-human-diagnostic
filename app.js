// Basic multi-dot glass diagnostic for Root Health

const glassImage = document.getElementById("glass-image");
const markerLayer = document.getElementById("marker-layer");
const areasList = document.getElementById("areas-list");
const summaryBox = document.getElementById("summary-text");
const clearBtn = document.getElementById("clear-btn");

const markers = [];

// Map coordinates to a region label + theme tags
function describeRegion(xPercent, yPercent) {
  let side = "";
  if (xPercent < 0.35) side = "left ";
  else if (xPercent > 0.65) side = "right ";
  else side = "central ";

  let zone;
  let tags = [];

  if (yPercent < 0.18) {
    zone = "head / mind";
    side = ""; // symmetrical
    tags.push("mind", "stress");
  } else if (yPercent < 0.32) {
    zone = "neck & shoulders";
    tags.push("stress", "tension");
  } else if (yPercent < 0.45) {
    zone = "chest / upper back";
    tags.push("breathing", "posture");
  } else if (yPercent < 0.58) {
    zone = "abdomen / lower back";
    tags.push("gut", "core", "lower-back");
  } else if (yPercent < 0.7) {
    zone = "hips & thighs";
    tags.push("hips", "mobility");
  } else if (yPercent < 0.82) {
    zone = "knees";
    tags.push("joints", "knees");
  } else {
    zone = "ankles / feet";
    tags.push("joints", "feet");
  }

  const label = `${side}${zone}`.trim();
  return { label, tags };
}

function addMarker(xPercent, yPercent) {
  const { label, tags } = describeRegion(xPercent, yPercent);

  const markerEl = document.createElement("div");
  markerEl.className = "marker";
  markerEl.style.left = `${xPercent * 100}%`;
  markerEl.style.top = `${yPercent * 100}%`;

  const markerObj = { xPercent, yPercent, label, tags, el: markerEl };

  markerEl.addEventListener("click", (e) => {
    e.stopPropagation();
    removeMarker(markerObj);
  });

  markerLayer.appendChild(markerEl);
  markers.push(markerObj);
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
  renderMarkers();
}

function clearMarkers() {
  markers.splice(0, markers.length);
  while (markerLayer.firstChild) {
    markerLayer.removeChild(markerLayer.firstChild);
  }
  renderMarkers();
}

function renderMarkers() {
  // List
  areasList.innerHTML = "";
  markers.forEach((m, idx) => {
    const li = document.createElement("li");
    li.className = "area-item";

    const info = document.createElement("div");
    const title = document.createElement("div");
    title.className = "area-label";
    title.textContent = `${idx + 1}. ${m.label}`;

    const meta = document.createElement("div");
    meta.className = "area-meta";
    meta.textContent = `X: ${(m.xPercent * 100).toFixed(
      0
    )}%, Y: ${(m.yPercent * 100).toFixed(0)}%`;

    info.appendChild(title);
    info.appendChild(meta);

    const removeBtn = document.createElement("button");
    removeBtn.className = "area-remove";
    removeBtn.type = "button";
    removeBtn.textContent = "×";
    removeBtn.title = "Remove";
    removeBtn.addEventListener("click", () => removeMarker(m));

    li.appendChild(info);
    li.appendChild(removeBtn);
    areasList.appendChild(li);
  });

  // Summary
  if (markers.length === 0) {
    summaryBox.innerHTML =
      "Tap on the glass human to begin. As you add dots, we&apos;ll highlight likely themes (joints, stress, gut, sleep, etc.).";
    return;
  }

  const themeCounts = {
    mind: 0,
    stress: 0,
    tension: 0,
    joints: 0,
    knees: 0,
    hips: 0,
    "lower-back": 0,
    gut: 0,
    core: 0,
    breathing: 0,
    posture: 0,
    feet: 0,
  };

  markers.forEach((m) => {
    m.tags.forEach((t) => {
      if (themeCounts[t] !== undefined) {
        themeCounts[t] += 1;
      }
    });
  });

  const themes = [];

  if (themeCounts.mind || themeCounts.stress) {
    themes.push({
      title: "Mind, stress and mental load",
      text:
        "Dots around the head, neck and shoulders often point to stress, overthinking or a nervous system that is working overtime.",
    });
  }

  if (themeCounts.joints || themeCounts.knees || themeCounts.hips) {
    themes.push({
      title: "Joints, alignment and load",
      text:
        "Knees, hips and feet carry impact and load. Repeated dots here can point to joint strain, pacing issues or support/muscle imbalances.",
    });
  }

  if (themeCounts["lower-back"] || themeCounts.core) {
    themes.push({
      title: "Lower back and core support",
      text:
        "Lower back and abdominal areas are often linked to posture, core support, sitting time and stress held in the midsection.",
    });
  }

  if (themeCounts.gut) {
    themes.push({
      title: "Gut and digestion",
      text:
        "Dots around the gut may relate to digestion, inflammation, food triggers or the way stress lands in the body.",
    });
  }

  if (themeCounts.feet) {
    themes.push({
      title: "Feet and foundations",
      text:
        "Feet and ankles affect balance, walking patterns and how load travels up through the whole chain.",
    });
  }

  if (themes.length === 0) {
    themes.push({
      title: "Mixed pattern",
      text:
        "You&apos;ve highlighted a spread of areas. Think about what most limits your day-to-day life &mdash; that&apos;s usually the best place to start working with Root Health.",
    });
  }

  let html = "<p>From the dots you&apos;ve placed we can see:</p><ul>";
  themes.forEach((t) => {
    html += `<li><strong>${t.title}:</strong> ${t.text}</li>`;
  });
  html += "</ul>";
  html +=
    "<p>This is a starting point, not a diagnosis. Inside Root Health you can turn these themes into coaching, routines and long-term tracking.</p>";

  summaryBox.innerHTML = html;
}

// Click on glass image to add marker
glassImage.addEventListener("click", (event) => {
  const rect = glassImage.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const xPercent = x / rect.width;
  const yPercent = y / rect.height;

  addMarker(xPercent, yPercent);
});

// Clear all button
clearBtn.addEventListener("click", () => {
  clearMarkers();
});

// Initial render
renderMarkers();
