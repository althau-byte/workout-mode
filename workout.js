// workout.js

let workout = null;
let sequence = []; // [{phase, name, seconds}]
let currentIndex = 0;
let remaining = 0;
let timerId = null;
let startedAt = null;
let totalElapsed = 0;
let completedExercises = 0;

const phaseLabelEl = document.getElementById("phase-label");
const exerciseNameEl = document.getElementById("exercise-name");
const timerDisplayEl = document.getElementById("timer-display");
const progressFillEl = document.getElementById("progress-fill");
const upcomingListEl = document.getElementById("upcoming-list");

const btnPrev = document.getElementById("btn-prev");
const btnPlay = document.getElementById("btn-play");
const btnNext = document.getElementById("btn-next");
const btnRestart = document.getElementById("btn-restart");
const btnExit = document.getElementById("btn-exit");

function parseQuery() {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("data");
  if (!raw) return null;
  try {
    const decoded = decodeURIComponent(raw);
    return JSON.parse(decoded);
  } catch (e) {
    console.error("Failed to parse data param:", e);
    return null;
  }
}

function normalizeWorkout(payload) {
  if (!payload) return null;
  if (payload.workout) return payload.workout;
  return payload;
}

function buildSequence(w) {
  const seq = [];
  (w.warmup || []).forEach((item) => {
    const { seconds, name } = parseExercise(item);
    seq.push({ phase: "Warmup", name, seconds });
  });
  (w.main || []).forEach((item) => {
    const { seconds, name } = parseExercise(item);
    seq.push({ phase: "Main", name, seconds });
  });
  return seq;
}

function parseExercise(text) {
  if (typeof text !== "string") return { seconds: 20, name: "Exercise" };
  const m = text.match(/(\d+)\s*s/i);
  const seconds = m ? parseInt(m[1], 10) : 20;
  const name = text.replace(/^\s*\d+\s*s\s*/i, "").trim() || text;
  return { seconds, name };
}

function formatSeconds(s) {
  return String(s).padStart(2, "0");
}

function renderCurrent() {
  if (!sequence.length) {
    phaseLabelEl.textContent = "Done";
    exerciseNameEl.textContent = "Workout complete";
    timerDisplayEl.textContent = "00";
    progressFillEl.style.width = "100%";
    return;
  }
  const cur = sequence[currentIndex];
  phaseLabelEl.textContent = cur.phase;
  exerciseNameEl.textContent = cur.name;
  timerDisplayEl.textContent = formatSeconds(remaining);
  const progress = ((sequence.length - currentIndex - 1) / sequence.length) * 100;
  progressFillEl.style.width = `${100 - progress}%`;
}

function renderUpcoming() {
  upcomingListEl.innerHTML = "";
  for (let i = currentIndex + 1; i < sequence.length; i++) {
    const item = sequence[i];
    const li = document.createElement("li");
    const nameSpan = document.createElement("span");
    nameSpan.textContent = item.name;
    const timeSpan = document.createElement("span");
    timeSpan.className = "time";
    timeSpan.textContent = `${item.seconds}s`;
    li.appendChild(nameSpan);
    li.appendChild(timeSpan);
    upcomingListEl.appendChild(li);
  }
}

function tick() {
  if (remaining <= 0) {
    completeCurrent();
    return;
  }
  remaining -= 1;
  totalElapsed += 1;
  timerDisplayEl.textContent = formatSeconds(remaining);
}

function startTimer() {
  if (timerId) return;
  if (!sequence.length) return;
  if (remaining <= 0) remaining = sequence[currentIndex].seconds;
  startedAt = Date.now();
  timerId = setInterval(tick, 1000);
  btnPlay.textContent = "⏸ Pause";
}

function pauseTimer() {
  if (!timerId) return;
  clearInterval(timerId);
  timerId = null;
  btnPlay.textContent = "▶️ Resume";
}

function completeCurrent() {
  completedExercises += 1;
  if (currentIndex < sequence.length - 1) {
    currentIndex += 1;
    remaining = sequence[currentIndex].seconds;
    renderCurrent();
    renderUpcoming();
  } else {
    finishWorkout();
  }
}

function finishWorkout() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
  renderCurrent();
  btnPlay.disabled = true;
  btnNext.disabled = true;
  btnPrev.disabled = true;

  const payload = {
    event: "workout_complete",
    duration: totalElapsed,
    exercises_completed: completedExercises,
    timestamp: new Date().toISOString(),
  };

  // 1) Human-friendly message
  TelegramBridge.sendData("Workout complete!");

  // 2) JSON payload
  TelegramBridge.sendData(payload);
}

function goPrev() {
  if (currentIndex === 0) return;
  currentIndex -= 1;
  remaining = sequence[currentIndex].seconds;
  renderCurrent();
  renderUpcoming();
}

function goNext() {
  if (currentIndex >= sequence.length - 1) {
    finishWorkout();
    return;
  }
  currentIndex += 1;
  remaining = sequence[currentIndex].seconds;
  renderCurrent();
  renderUpcoming();
}

function restartWorkout() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
  currentIndex = 0;
  remaining = sequence.length ? sequence[0].seconds : 0;
  totalElapsed = 0;
  completedExercises = 0;
  btnPlay.disabled = false;
  btnNext.disabled = false;
  btnPrev.disabled = false;
  btnPlay.textContent = "▶️ Start";
  renderCurrent();
  renderUpcoming();
}

function exitWorkout() {
  TelegramBridge.close();
}

function init() {
  TelegramBridge.ready();

  const payload = parseQuery();
  workout = normalizeWorkout(payload);

  if (!workout) {
    exerciseNameEl.textContent = "No workout data provided.";
    return;
  }

  sequence = buildSequence(workout);
  if (!sequence.length) {
    exerciseNameEl.textContent = "Empty workout.";
    return;
  }

  currentIndex = 0;
  remaining = sequence[0].seconds;
  renderCurrent();
  renderUpcoming();

  btnPlay.addEventListener("click", () => {
    if (timerId) {
      pauseTimer();
    } else {
      startTimer();
    }
  });

  btnPrev.addEventListener("click", goPrev);
  btnNext.addEventListener("click", goNext);
  btnRestart.addEventListener("click", restartWorkout);
  btnExit.addEventListener("click", exitWorkout);
}

document.addEventListener("DOMContentLoaded", init);
