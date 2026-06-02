function getRoutineFromURL() {
  const params = new URLSearchParams(window.location.search);
  const routineParam = params.get("routine");
  if (!routineParam) return [];

  try {
    return JSON.parse(routineParam);
  } catch (e) {
    console.error("Invalid routine JSON", e);
    return [];
  }
}

const routine = getRoutineFromURL();
let currentIndex = 0;
let timerInterval = null;

const exerciseNameEl = document.getElementById("exercise-name");
const timerEl = document.getElementById("timer");
const progressEl = document.getElementById("progress");
const routineListEl = document.getElementById("routine-list");
const startBtn = document.getElementById("start-btn");

function renderRoutineList() {
  routineListEl.innerHTML = routine
    .map((ex, i) => `<div>${i + 1}. ${ex.name} — ${ex.duration}s</div>`)
    .join("");
}

function startExercise(index) {
  if (index >= routine.length) {
    exerciseNameEl.textContent = "Workout Complete!";
    timerEl.textContent = "✔";
    progressEl.style.width = "100%";

    // Optional: send callback to Telegram bot
    // fetch("https://your-bot-endpoint.com/workout-complete");

    return;
  }

  const exercise = routine[index];
  exerciseNameEl.textContent = exercise.name;

  let remaining = exercise.duration;
  timerEl.textContent = remaining;

  progressEl.style.width = "0%";

  timerInterval = setInterval(() => {
    remaining--;
    timerEl.textContent = remaining;

    const pct = ((exercise.duration - remaining) / exercise.duration) * 100;
    progressEl.style.width = pct + "%";

    if (remaining <= 0) {
      clearInterval(timerInterval);
      currentIndex++;
      startExercise(currentIndex);
    }
  }, 1000);
}

startBtn.addEventListener("click", () => {
  startBtn.style.display = "none";
  startExercise(0);
});

renderRoutineList();
