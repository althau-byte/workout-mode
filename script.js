// script.js

let routine = [];
let currentIndex = 0;
let currentTime = 0;
let interval = null;
let musicOn = false;

// DOM elements
const routineText = document.getElementById("routine-text");
const exerciseName = document.getElementById("exercise-name");
const timeDisplay = document.getElementById("time-display");
const progress = document.getElementById("progress");
const startBtn = document.getElementById("start-btn");
const musicBtn = document.getElementById("music-btn");

// -----------------------------
// Load session from ?data=
// -----------------------------
function loadSessionFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get("data");

  if (!encoded) {
    loadFallbackRoutine();
    return;
  }

  try {
    const json = atob(encoded.replace(/-/g, "+").replace(/_/g, "/"));
    const session = JSON.parse(json);

    // Handle nested structure: session.routine.routine
    if (session.routine && Array.isArray(session.routine.routine)) {
      routine = session.routine.routine;
      routineText.textContent = routine
        .map(r => `${r.name} — ${r.duration}s`)
        .join(" | ");
    } else {
      loadFallbackRoutine();
    }

  } catch (e) {
    console.error("Failed to decode session:", e);
    loadFallbackRoutine();
  }
}

// -----------------------------
// Fallback routine
// -----------------------------
function loadFallbackRoutine() {
  routine = [
    { name: "Jumping Jacks", duration: 10 },
    { name: "Push-ups", duration: 10 },
    { name: "Squats", duration: 10 }
  ];

  routineText.textContent =
    "Fallback routine: " +
    routine.map(r => `${r.name} — ${r.duration}s`).join(" | ");
}

// -----------------------------
// Format time
// -----------------------------
function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// -----------------------------
// Start workout
// -----------------------------
startBtn.onclick = () => {
  startBtn.style.display = "none";
  currentIndex = 0;
  startExercise();
};

// -----------------------------
// Toggle music (UI only)
// -----------------------------
musicBtn.onclick = () => {
  musicOn = !musicOn;
  musicBtn.textContent = musicOn ? "Music: ON" : "Music: OFF";
};

// -----------------------------
// Start a single exercise
// -----------------------------
function startExercise() {
  if (currentIndex >= routine.length) {
    exerciseName.textContent = "Workout Complete!";
    timeDisplay.textContent = "00:00";
    progress.style.width = "100%";
    return;
  }

  const exercise = routine[currentIndex];
  exerciseName.textContent = exercise.name;

  currentTime = exercise.duration;
  timeDisplay.textContent = formatTime(currentTime);
  progress.style.width = "0%";

  interval = setInterval(() => {
    currentTime--;
    timeDisplay.textContent = formatTime(currentTime);

    const pct = ((exercise.duration - currentTime) / exercise.duration) * 100;
    progress.style.width = pct + "%";

    if (currentTime <= 0) {
      clearInterval(interval);
      currentIndex++;
      startExercise();
    }
  }, 1000);
}

// -----------------------------
// Initialize
// -----------------------------
loadSessionFromUrl();
