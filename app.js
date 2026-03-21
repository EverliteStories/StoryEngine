const state = {
  module: null,
  currentSection: "section1",
  custom: {},
  meters: {
    courage_meter: 0,
    empathy_meter: 0,
    curiosity_meter: 0,
    calm_meter: 0,
    bond_pet: 0
  }
};

const startBtn = document.getElementById("startBtn");
const storyCard = document.getElementById("storyCard");
const storyTitle = document.getElementById("storyTitle");
const storyText = document.getElementById("storyText");
const choicesBox = document.getElementById("choices");
const meterBox = document.getElementById("meterBox");

function renderTemplate(text, custom) {
  return text.replace(/\{\{(.*?)\}\}/g, (_, key) => {
    return custom[key.trim()] ?? "";
  });
}

function applyEffects(effect = {}) {
  for (const key in effect) {
    if (state.meters[key] !== undefined) {
      state.meters[key] += effect[key];
    }
  }
}

function getDecisionById(id) {
  return state.module.decisions.find(d => d.id === id);
}

function updateMeterBox() {
  if (!meterBox) return;

  meterBox.textContent =
    "Brave: " + state.meters.courage_meter +
    " | Kind: " + state.meters.empathy_meter +
    " | Curious: " + state.meters.curiosity_meter +
    " | Calm: " + state.meters.calm_meter +
    " | Pet Bond: " + state.meters.bond_pet;
}

function getPathType() {
  if (
    state.meters.courage_meter >= state.meters.empathy_meter &&
    state.meters.courage_meter >= state.meters.curiosity_meter
  ) {
    return "brave";
  }

  if (
    state.meters.empathy_meter >= state.meters.courage_meter &&
    state.meters.empathy_meter >= state.meters.curiosity_meter
  ) {
    return "kind";
  }

  return "curious";
}

function addFlavorText(baseText) {
  let finalText = baseText;

  const pathType = getPathType();

  if (pathType === "brave" && state.meters.courage_meter >= 2) {
    finalText += "\n\n{{child_name}} felt a little braver now, as if the night trusted each step.";
  }

  if (pathType === "kind" && state.meters.empathy_meter >= 2) {
    finalText += "\n\nThe world seemed softer somehow, as though kindness had changed the air itself.";
  }

  if (pathType === "curious" && state.meters.curiosity_meter >= 2) {
    finalText += "\n\nTiny details began to stand out, like the realm was rewarding careful noticing.";
  }

  if (state.meters.bond_pet >= 2) {
    finalText += "\n\nThe {{pet_archetype}} stayed especially close, moving with the easy trust of a true teammate.";
  }

  if (state.custom.pet_archetype === "tiny dragon") {
    finalText += "\n\nThe tiny dragon gave a warm little huff, its bright eyes glowing with excitement.";
  }

  if (state.custom.pet_archetype === "forest guardian") {
    finalText += "\n\nThe forest guardian moved quietly, noticing the small changes in leaves, light, and wind.";
  }

  if (state.custom.pet_archetype === "ocean spirit") {
    finalText += "\n\nThe ocean spirit drifted gracefully nearby, calm as moonlight on water.";
  }

  if (state.custom.pet_archetype === "cloud fox") {
    finalText += "\n\nThe cloud fox padded lightly ahead, quick and curious, always ready to discover something first.";
  }

  if (state.custom.skill_archetype === "lightweaving") {
    finalText += "\n\nA soft glow seemed ready to gather at {{child_name}}'s fingertips.";
  }

  if (state.custom.skill_archetype === "harmony voice") {
    finalText += "\n\nIt felt like even the quietest sound might become soothing in {{child_name}}'s voice.";
  }

  if (state.custom.skill_archetype === "pattern sight") {
    finalText += "\n\nShapes, rhythms, and hidden connections began to feel easier to notice.";
  }

  if (state.custom.skill_archetype === "heartshield") {
    finalText += "\n\nA warm feeling of safety seemed to spread gently outward from {{child_name}}.";
  }

  if (state.custom.personality_trait === "brave") {
    finalText += "\n\nEven when the moment felt mysterious, {{child_name}} stood steady.";
  }

  if (state.custom.personality_trait === "kind") {
    finalText += "\n\n{{child_name}} seemed to notice feelings as carefully as footsteps.";
  }

  if (state.custom.personality_trait === "curious") {
    finalText += "\n\nQuestions flickered gently in {{child_name}}'s mind like tiny stars.";
  }

  if (state.custom.personality_trait === "calm") {
    finalText += "\n\nA quiet steadiness seemed to follow {{child_name}} wherever the story went.";
  }

  return finalText;
}

function renderEnding(endingKey) {
  let ending = state.module.endings[endingKey];
  const pathType = getPathType();

  if (pathType === "brave" && state.module.endings.A) {
    ending = state.module.endings.A;
  } else if (pathType === "kind" && state.module.endings.B) {
    ending = state.module.endings.B;
  } else if (pathType === "curious" && state.module.endings.C) {
    ending = state.module.endings.C;
  }

  const reward = { ...ending.reward };

  if (state.meters.bond_pet >= 2 && pathType === "kind") {
    reward.item = "Heartglow Ribbon";
  } else if (pathType === "brave") {
    reward.item = reward.item || "Star Flame Thread";
  } else if (pathType === "curious") {
    reward.item = reward.item || "Moon Pattern Leaf";
  }

  let endingText = renderTemplate(ending.text, state.custom);

  if (pathType === "brave") {
    endingText += "\n\nThe realm seemed to shine a little brighter for brave choices.";
  } else if (pathType === "kind") {
    endingText += "\n\nEverything felt gentler now, as if kindness had helped the whole night rest easier.";
  } else if (pathType === "curious") {
    endingText += "\n\nA quiet sense of discovery lingered in the air, like the world had shared one more secret.";
  }

  storyText.textContent =
    endingText +
    "\n\nCollectible: " + reward.item +
    (reward.tier ? " (" + reward.tier + ")" : "") +
    "\nHook: " + ending.hook;

  choicesBox.innerHTML = `<button onclick="location.reload()">Play Again</button>`;

  updateMeterBox();
}

function renderSection(sectionKey) {
  state.currentSection = sectionKey;

  const section = state.module.scenes[sectionKey];
  if (!section) {
    storyTitle.textContent = "Error";
    storyText.textContent = "Could not find " + sectionKey;
    choicesBox.innerHTML = "";
    storyCard.classList.remove("hidden");
    return;
  }

  const variant = section.A;
  if (!variant) {
    storyTitle.textContent = "Error";
    storyText.textContent = "Could not find variant A in " + sectionKey;
    choicesBox.innerHTML = "";
    storyCard.classList.remove("hidden");
    return;
  }

  const rawText = variant.expanded_text || variant.text || "";
  let finalText = renderTemplate(rawText, state.custom);
  finalText = addFlavorText(finalText);
  finalText = renderTemplate(finalText, state.custom);

  storyTitle.textContent = state.module.metadata.title;
  storyText.textContent = finalText;
  storyCard.classList.remove("hidden");

  const decision = getDecisionById(variant.next_decision);
  if (!decision) {
    choicesBox.innerHTML = "";
    updateMeterBox();
    return;
  }

  choicesBox.innerHTML = `<p>${decision.prompt}</p>`;

  decision.choices.forEach(choice => {
    const btn = document.createElement("button");
    btn.textContent = choice.label;
    btn.onclick = () => handleChoice(choice);
    choicesBox.appendChild(btn);
  });

  updateMeterBox();
}

function handleChoice(choice) {
  applyEffects(choice.effect || {});

  if (["A", "B", "C"].includes(choice.next)) {
    renderEnding(choice.next);
    return;
  }

  renderSection(choice.next);
}

async function startStory() {
  try {
    state.custom = {
      child_name: document.getElementById("childName").value.trim() || "Friend",
      pet_archetype: document.getElementById("petArchetype").value.trim() || "forest guardian",
      skill_archetype: document.getElementById("skillArchetype").value.trim() || "lightweaving",
      personality_trait: document.getElementById("personalityTrait").value.trim() || "kind"
    };

    const storySelect = document.getElementById("storySelect");
    const selectedStory = storySelect
      ? storySelect.value
      : "curtain_of_cozy_stars.json";

    const response = await fetch("./Modules/" + selectedStory);

    if (!response.ok) {
      throw new Error("Could not load JSON file. Status: " + response.status);
    }

    state.module = await response.json();

    state.meters = {
      courage_meter: 0,
      empathy_meter: 0,
      curiosity_meter: 0,
      calm_meter: 0,
      bond_pet: 0
    };

    renderSection("section1");
  } catch (error) {
    storyCard.classList.remove("hidden");
    storyTitle.textContent = "Something went wrong";
    storyText.textContent = error.message;
    choicesBox.innerHTML = "";
  }
}

startBtn.addEventListener("click", startStory);
