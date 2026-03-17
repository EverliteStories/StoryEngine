const state = {
  module: null,
  currentSection: "section1",
  custom: {}
};

const startBtn = document.getElementById("startBtn");
const storyCard = document.getElementById("storyCard");
const storyTitle = document.getElementById("storyTitle");
const storyText = document.getElementById("storyText");
const choicesBox = document.getElementById("choices");

function renderTemplate(text, custom) {
  return text.replace(/\{\{(.*?)\}\}/g, (_, key) => {
    return custom[key.trim()] ?? "";
  });
}

function getDecisionById(id) {
  return state.module.decisions.find(d => d.id === id);
}

function renderEnding(endingKey) {
  const ending = state.module.endings[endingKey];

  const endingText = renderTemplate(ending.text, state.custom);

  storyText.textContent =
    endingText +
    "\n\nCollectible: " + ending.reward.item +
    "\nHook: " + ending.hook;

  choicesBox.innerHTML =
    `<button onclick="location.reload()">Play Again</button>`;
}

Collectible: ${ending.reward.item}
Hook: ${ending.hook}`;
  choicesBox.innerHTML = `<button onclick="location.reload()">Play Again</button>`;
}

function renderSection(sectionKey) {
  const section = state.module.scenes[sectionKey];
  const variant = section.A;

  storyTitle.textContent = state.module.metadata.title;
  storyText.textContent = renderTemplate(variant.text, state.custom);
  storyCard.classList.remove("hidden");

  const decision = getDecisionById(variant.next_decision);
  choicesBox.innerHTML = `<p>${decision.prompt}</p>`;

  decision.choices.forEach(choice => {
    const btn = document.createElement("button");
    btn.textContent = choice.label;
    btn.onclick = () => handleChoice(choice);
    choicesBox.appendChild(btn);
  });
}

function nextSectionKey(current) {
  const n = Number(current.replace("section", ""));
  if (n >= 6) return null;
  return `section${n + 1}`;
}

function handleChoice(choice) {
  if (["A", "B", "C"].includes(choice.next)) {
    renderEnding(choice.next);
    return;
  }

  const next = choice.next || nextSectionKey(state.currentSection);
  state.currentSection = next;
  renderSection(next);
}

async function startStory() {
  state.custom = {
    child_name: document.getElementById("childName").value.trim() || "Friend",
    pet_archetype: document.getElementById("petArchetype").value.trim() || "forest guardian",
    skill_archetype: document.getElementById("skillArchetype").value.trim() || "lightweaving",
    personality_trait: document.getElementById("personalityTrait").value.trim() || "kind"
  };

  const response = await fetch("./Modules/curtain_of_cozy_stars.json");
  state.module = await response.json();

  renderSection("section1");
}

startBtn.addEventListener("click", startStory);
