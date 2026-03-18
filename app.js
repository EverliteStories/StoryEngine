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

  choicesBox.innerHTML = `<button onclick="location.reload()">Play Again</button>`;
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

  storyTitle.textContent = state.module.metadata.title;
  storyText.textContent = renderTemplate(rawText, state.custom);
  storyCard.classList.remove("hidden");

  const decision = getDecisionById(variant.next_decision);
  if (!decision) {
    choicesBox.innerHTML = "";
    return;
  }

  choicesBox.innerHTML = `<p>${decision.prompt}</p>`;

  decision.choices.forEach(choice => {
    const btn = document.createElement("button");
    btn.textContent = choice.label;
    btn.onclick = () => handleChoice(choice);
    choicesBox.appendChild(btn);
  });
}

function handleChoice(choice) {
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

    const selectedStory = document.getElementById("storySelect").value;
    const response = await fetch("./Modules/" + selectedStory);

    if (!response.ok) {
      throw new Error("Could not load JSON file. Status: " + response.status);
    }

    state.module = await response.json();

    renderSection("section1");
  } catch (error) {
    storyCard.classList.remove("hidden");
    storyTitle.textContent = "Something went wrong";
    storyText.textContent = error.message;
    choicesBox.innerHTML = "";
  }
}

startBtn.addEventListener("click", startStory);
