"use strict";

const PUZZLES = [
  {
    id: "rhythm-one",
    number: "01",
    kicker: "Act I · Level 1 · Warm-up",
    title: "Find the rhythm",
    narrative: "The shapes are humming in a loop. Listen with your eyes and give the sequence its next beat.",
    instruction: "Which shape continues the rhythm?",
    badge: "Repeat",
    difficulty: "Easy",
    type: "sequence",
    sequence: ["circle", "triangle", "circle", "triangle", null],
    sequenceLabel: "Circle, triangle, circle, triangle, missing shape",
    choices: ["triangle", "square", "circle"],
    answer: "circle",
    hint: "Try reading the shapes in pairs: first, second… first, second…",
    success: "Yes — circle and triangle take turns. The rhythm is awake!"
  },
  {
    id: "rhythm-two",
    number: "02",
    kicker: "Act I · Level 2 · Building",
    title: "Stretch the rhythm",
    narrative: "The loop has grown longer. This time, two matching beats arrive before the pattern changes.",
    instruction: "Complete the longer repeating phrase.",
    badge: "Group",
    difficulty: "Medium",
    type: "sequence",
    sequence: ["circle", "circle", "triangle", "circle", "circle", "triangle", "circle", "circle", null],
    sequenceLabel: "Circle, circle, triangle, circle, circle, triangle, circle, circle, missing shape",
    choices: ["square", "triangle", "circle"],
    answer: "triangle",
    hint: "Break the line into groups of three. Each group uses two circles, then one other shape.",
    success: "Exactly — two circles lead into a triangle. The longer rhythm now moves as one!"
  },
  {
    id: "outlier-one",
    number: "03",
    kicker: "Act II · Level 3 · Compare",
    title: "Break the pattern",
    narrative: "Most shapes know the dance. One has forgotten the step — find the shape that breaks the alternating rule.",
    instruction: "Select the shape that does not belong.",
    badge: "Compare",
    difficulty: "Medium",
    type: "outlier",
    items: ["circle", "square", "circle", "square", "triangle", "square", "circle", "square"],
    itemsLabel: "Alternating circle and square pattern with one outlier",
    answer: 4,
    hint: "Follow every other shape. The odd positions should all match each other.",
    success: "Found it — that triangle interrupted the circle–square dance!"
  },
  {
    id: "outlier-two",
    number: "04",
    kicker: "Act II · Level 4 · Challenge",
    title: "Follow the cycle",
    narrative: "Three shapes now travel as a repeating phrase. One position has copied the wrong neighbor.",
    instruction: "Find the shape that breaks the three-part cycle.",
    badge: "Cycle",
    difficulty: "Hard",
    type: "outlier",
    items: ["circle", "triangle", "square", "circle", "triangle", "square", "circle", "square", "square", "circle", "triangle", "square"],
    itemsLabel: "Repeating circle, triangle, square cycle with one outlier",
    answer: 7,
    hint: "Read the row in groups of three: circle, triangle, square. Which group changes its middle beat?",
    success: "You caught it — the middle shape in that group should have been a triangle!"
  },
  {
    id: "connect-one",
    number: "05",
    kicker: "Act III · Level 5 · Connect",
    title: "Connect the grid",
    narrative: "The final composition alternates across every row and column. Restore both missing pieces to bring it into harmony.",
    instruction: "Complete the two glowing spaces, one at a time.",
    badge: "Complete",
    difficulty: "Hard",
    type: "connect",
    size: 3,
    grid: ["circle", "triangle", "circle", "triangle", null, "triangle", "circle", null, "circle"],
    steps: [
      { index: 4, answer: "circle" },
      { index: 7, answer: "triangle" }
    ],
    choices: ["square", "circle", "triangle"],
    hint: "Look both across and down: circle and triangle always take turns.",
    success: "Every row and column now shares the same visual rhythm. Harmony restored!"
  },
  {
    id: "connect-two",
    number: "06",
    kicker: "Act III · Level 6 · Master pattern",
    title: "Restore the system",
    narrative: "The world reveals its largest rule: a three-shape cycle moving across four rows and four columns.",
    instruction: "Restore all three missing positions in the final system.",
    badge: "Synthesize",
    difficulty: "Expert",
    type: "connect",
    size: 4,
    grid: [
      "circle", "triangle", "square", "circle",
      "triangle", null, "circle", "triangle",
      "square", null, "triangle", "square",
      "circle", "triangle", null, "circle"
    ],
    steps: [
      { index: 5, answer: "square" },
      { index: 9, answer: "circle" },
      { index: 14, answer: "square" }
    ],
    choices: ["triangle", "square", "circle"],
    hint: "Trace any complete row: circle, triangle, square, then the cycle begins again. Each new row starts one step later.",
    success: "You restored the master pattern — every row and column now belongs to the same living system!"
  }
];

const COLORS = {
  circle: "var(--coral)",
  triangle: "var(--cobalt)",
  square: "var(--yellow)"
};

const SHAPE_NAMES = { circle: "circle", triangle: "triangle", square: "square" };
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const state = {
  screen: "opening",
  stage: 0,
  locked: false,
  completingStage: false,
  sound: false,
  connectStep: 0,
  connectAnswers: {}
};

const elements = {
  screens: [...document.querySelectorAll("[data-screen]")],
  restart: document.querySelector(".restart-control"),
  soundButton: document.querySelector("[data-action='sound']"),
  soundLabel: document.querySelector(".sound-label"),
  soundIcon: document.querySelector(".sound-icon"),
  counter: document.querySelector("#stage-counter"),
  kicker: document.querySelector("#stage-kicker"),
  title: document.querySelector("#stage-title"),
  narrative: document.querySelector("#stage-narrative"),
  instruction: document.querySelector("#puzzle-instruction"),
  badge: document.querySelector("#pattern-badge"),
  board: document.querySelector("#puzzle-board"),
  feedback: document.querySelector("#feedback"),
  feedbackIcon: document.querySelector(".feedback-icon"),
  feedbackText: document.querySelector(".feedback-text"),
  puzzleCard: document.querySelector("#puzzle-card"),
  progressFill: document.querySelector("#progress-fill"),
  progressLabel: document.querySelector("#progress-label"),
  wipe: document.querySelector(".transition-wipe")
};

let audioContext = null;

function createTone(frequency, duration, options = {}) {
  if (!state.sound) return;
  audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
  if (audioContext.state === "suspended") audioContext.resume();

  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = options.type || "sine";
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  if (options.endFrequency) {
    oscillator.frequency.exponentialRampToValueAtTime(options.endFrequency, audioContext.currentTime + duration);
  }
  gain.gain.setValueAtTime(options.volume || 0.05, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
}

function playSound(kind) {
  if (!state.sound) return;
  if (kind === "pop") createTone(360, 0.09, { endFrequency: 520, type: "sine", volume: 0.045 });
  if (kind === "wrong") createTone(180, 0.18, { endFrequency: 130, type: "triangle", volume: 0.035 });
  if (kind === "correct") {
    createTone(440, 0.22, { endFrequency: 660, volume: 0.045 });
    window.setTimeout(() => createTone(660, 0.25, { endFrequency: 880, volume: 0.04 }), 110);
  }
  if (kind === "celebrate") {
    [523, 659, 784, 1047].forEach((tone, index) => {
      window.setTimeout(() => createTone(tone, 0.35, { endFrequency: tone * 1.04, volume: 0.035 }), index * 90);
    });
  }
}

function toggleSound() {
  state.sound = !state.sound;
  elements.soundButton.setAttribute("aria-pressed", String(state.sound));
  elements.soundButton.setAttribute("aria-label", state.sound ? "Turn sound off" : "Turn sound on");
  elements.soundLabel.textContent = state.sound ? "Sound on" : "Sound off";
  elements.soundIcon.textContent = state.sound ? "♪" : "◖";
  if (state.sound) playSound("pop");
}

function setScreen(name, useWipe = true) {
  const switchView = () => {
    state.screen = name;
    elements.screens.forEach((screen) => screen.classList.toggle("is-active", screen.dataset.screen === name));
    elements.restart.classList.toggle("is-hidden", name !== "puzzle");
    const active = elements.screens.find((screen) => screen.dataset.screen === name);
    active?.querySelector("h1, h2, button")?.focus({ preventScroll: true });
  };

  if (!useWipe || reduceMotion) {
    switchView();
    return;
  }

  elements.wipe.classList.add("is-active");
  window.setTimeout(switchView, 470);
  window.setTimeout(() => elements.wipe.classList.remove("is-active"), 1100);
}

function resetGame(startImmediately = false) {
  state.stage = 0;
  state.locked = false;
  state.completingStage = false;
  state.connectStep = 0;
  state.connectAnswers = {};
  elements.puzzleCard.classList.remove("is-celebrating");
  if (startImmediately) {
    renderStage();
    setScreen("puzzle");
  } else {
    setScreen("opening");
  }
}

function makeToken(shape, extraClass = "") {
  if (!shape) return `<span class="token is-missing ${extraClass}" aria-hidden="true">?</span>`;
  return `<span class="token ${extraClass}" data-shape="${shape}" style="--token-color:${COLORS[shape]}"><span class="token-shape" aria-hidden="true"></span></span>`;
}

function makeChoice(shape, index) {
  return `<button class="choice-token" type="button" data-choice="${shape}" aria-label="Choose ${SHAPE_NAMES[shape]}">${makeToken(shape)}<span class="sr-only">${index + 1}</span></button>`;
}

function setFeedback(message, type = "neutral") {
  elements.feedback.className = `feedback${type === "neutral" ? "" : ` is-${type}`}`;
  elements.feedbackIcon.textContent = type === "wrong" ? "×" : type === "correct" ? "✓" : "✦";
  elements.feedbackText.textContent = message;
}

function updateProgress() {
  const percent = Math.round((state.stage / PUZZLES.length) * 100);
  elements.progressFill.style.width = `${percent}%`;
  elements.progressLabel.textContent = `World restored: ${percent}%`;
}

function renderStage() {
  const puzzle = PUZZLES[state.stage];
  state.locked = false;
  state.completingStage = false;
  state.connectStep = 0;
  state.connectAnswers = {};
  elements.puzzleCard.classList.remove("is-celebrating");
  elements.counter.textContent = `${puzzle.number} / ${String(PUZZLES.length).padStart(2, "0")}`;
  elements.kicker.textContent = puzzle.kicker;
  elements.title.textContent = puzzle.title;
  elements.narrative.textContent = puzzle.narrative;
  elements.instruction.textContent = puzzle.instruction;
  elements.badge.textContent = `${puzzle.badge} · ${puzzle.difficulty}`;
  setFeedback("Take your time. The pattern is waiting.");
  updateProgress();

  if (puzzle.type === "sequence") renderSequence(puzzle);
  if (puzzle.type === "outlier") renderOutlier(puzzle);
  if (puzzle.type === "connect") renderConnect(puzzle);
}

function renderSequence(puzzle) {
  const sequence = puzzle.sequence.map((shape, index) => {
    const token = makeToken(shape, shape ? "" : "missing-slot");
    return `${token}${index < puzzle.sequence.length - 1 ? '<span class="sequence-connector" aria-hidden="true"></span>' : ""}`;
  }).join("");

  elements.board.innerHTML = `
    <div class="sequence-layout">
      <div class="sequence-row${puzzle.sequence.length > 6 ? " is-long" : ""}" aria-label="${puzzle.sequenceLabel}">${sequence}</div>
      <div class="choice-area">
        <p class="choice-label">Choose the next beat</p>
        <div class="choice-row">${puzzle.choices.map(makeChoice).join("")}</div>
      </div>
    </div>`;
}

function renderOutlier(puzzle) {
  elements.board.innerHTML = `
    <div class="odd-grid" aria-label="${puzzle.itemsLabel}">
      ${puzzle.items.map((shape, index) => `
        <button class="odd-token" type="button" data-index="${index + 1}" data-item-index="${index}" aria-label="Shape ${index + 1}: ${shape}">
          ${makeToken(shape)}
        </button>`).join("")}
    </div>`;
}

function renderConnect(puzzle) {
  const activeStep = puzzle.steps[state.connectStep];
  const grid = puzzle.grid.map((shape, index) => {
    const restored = state.connectAnswers[index];
    if (shape || restored) {
      return `<span class="grid-token${restored ? " is-filled" : ""}">${makeToken(shape || restored)}</span>`;
    }
    const isCurrent = activeStep?.index === index;
    return `<span class="grid-token is-target${isCurrent ? " is-current" : ""}" aria-label="Missing position ${index + 1}">${isCurrent ? "?" : "·"}</span>`;
  }).join("");

  elements.board.innerHTML = `
    <div class="connect-layout">
      <div class="pattern-grid" style="--grid-size:${puzzle.size}" aria-label="${puzzle.size} by ${puzzle.size} visual pattern">${grid}</div>
      <div class="connect-choices">
        <h3>${activeStep ? `Missing piece ${state.connectStep + 1} of ${puzzle.steps.length}` : "Pattern complete"}</h3>
        <p>Which shape keeps its row and column in rhythm?</p>
        <div class="choice-row">${puzzle.choices.map(makeChoice).join("")}</div>
      </div>
    </div>`;
}

function handleChoice(button) {
  if (state.locked) return;
  const puzzle = PUZZLES[state.stage];
  playSound("pop");

  if (puzzle.type === "sequence") checkSequence(button, puzzle);
  if (puzzle.type === "outlier") checkOutlier(button, puzzle);
  if (puzzle.type === "connect") checkConnect(button, puzzle);
}

function markWrong(button, hint) {
  button.classList.remove("is-wrong");
  void button.offsetWidth;
  button.classList.add("is-wrong");
  setFeedback(`Not quite. ${hint}`, "wrong");
  playSound("wrong");
  window.setTimeout(() => button.classList.remove("is-wrong"), 650);
}

function checkSequence(button, puzzle) {
  if (button.dataset.choice !== puzzle.answer) {
    markWrong(button, puzzle.hint);
    return;
  }
  button.classList.add("is-correct");
  const missing = elements.board.querySelector(".is-missing");
  missing.outerHTML = makeToken(puzzle.answer, "is-restored");
  completeStage(puzzle);
}

function checkOutlier(button, puzzle) {
  const selected = Number(button.dataset.itemIndex);
  if (selected !== puzzle.answer) {
    markWrong(button, puzzle.hint);
    return;
  }
  button.classList.add("is-correct", "is-transformed");
  completeStage(puzzle);
}

function checkConnect(button, puzzle) {
  const step = puzzle.steps[state.connectStep];
  if (button.dataset.choice !== step.answer) {
    markWrong(button, puzzle.hint);
    return;
  }

  button.classList.add("is-correct");
  state.connectAnswers[step.index] = step.answer;
  playSound("correct");
  setFeedback(`Correct — a ${step.answer} keeps the alternation going.`, "correct");
  state.locked = true;

  window.setTimeout(() => {
    state.connectStep += 1;
    if (state.connectStep < puzzle.steps.length) {
      state.locked = false;
      renderConnect(puzzle);
      const remaining = puzzle.steps.length - state.connectStep;
      setFeedback(`Connection found. ${remaining} missing ${remaining === 1 ? "piece remains" : "pieces remain"}.`, "correct");
    } else {
      renderConnect(puzzle);
      completeStage(puzzle);
    }
  }, reduceMotion ? 80 : 650);
}

function completeStage(puzzle) {
  if (state.completingStage) return;
  state.completingStage = true;
  state.locked = true;
  setFeedback(puzzle.success, "correct");
  elements.puzzleCard.classList.add("is-celebrating");
  playSound("correct");

  const completed = state.stage + 1;
  const percent = Math.round((completed / PUZZLES.length) * 100);
  elements.progressFill.style.width = `${percent}%`;
  elements.progressLabel.textContent = `World restored: ${percent}%`;

  window.setTimeout(() => {
    if (state.stage < PUZZLES.length - 1) {
      state.stage += 1;
      renderStage();
      setScreen("puzzle");
    } else {
      playSound("celebrate");
      setScreen("ending");
    }
  }, reduceMotion ? 400 : 1700);
}

document.addEventListener("click", (event) => {
  const action = event.target.closest("[data-action]")?.dataset.action;
  if (action === "start") resetGame(true);
  if (action === "restart") resetGame(true);
  if (action === "play-again") resetGame(true);
  if (action === "home") resetGame(false);
  if (action === "sound") toggleSound();

  const choice = event.target.closest(".choice-token, .odd-token");
  if (choice) handleChoice(choice);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && state.screen !== "opening") resetGame(false);
});

setScreen("opening", false);
