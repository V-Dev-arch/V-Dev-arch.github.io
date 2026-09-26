const TZ = "Asia/Kolkata";
const NOTE_KEY = "velora-note";
const SHIFT_SECONDS = 25 * 60;

const clockEl = document.getElementById("clock");
const dateEl = document.getElementById("clock-date");
const timerEl = document.getElementById("timer");
const timerState = document.getElementById("timer-state");
const timerBar = document.getElementById("timer-bar");
const toggleBtn = document.getElementById("timer-toggle");
const resetBtn = document.getElementById("timer-reset");
const noteEl = document.getElementById("note");
const noteCount = document.getElementById("note-count");
const noteClear = document.getElementById("note-clear");

const timeFmt = new Intl.DateTimeFormat("en-IN", {
  timeZone: TZ,
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

const dateFmt = new Intl.DateTimeFormat("en-IN", {
  timeZone: TZ,
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

function renderClock() {
  const now = new Date();
  clockEl.textContent = timeFmt.format(now);
  dateEl.textContent = `${dateFmt.format(now)} · IST`;
}

let remaining = SHIFT_SECONDS;
let running = false;
let lastTick = 0;
let frame = 0;

function formatMmSs(total) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function renderTimer() {
  timerEl.textContent = formatMmSs(remaining);
  const used = (SHIFT_SECONDS - remaining) / SHIFT_SECONDS;
  timerBar.style.width = `${Math.min(100, Math.max(0, used * 100))}%`;
}

function loop(ts) {
  if (!running) return;
  if (!lastTick) lastTick = ts;
  if (ts - lastTick >= 1000) {
    const steps = Math.floor((ts - lastTick) / 1000);
    remaining = Math.max(0, remaining - steps);
    lastTick += steps * 1000;
    renderTimer();
    if (remaining === 0) {
      running = false;
      timerState.textContent = "Done";
      toggleBtn.textContent = "Start";
      return;
    }
  }
  frame = requestAnimationFrame(loop);
}

toggleBtn.addEventListener("click", () => {
  if (remaining === 0) remaining = SHIFT_SECONDS;
  running = !running;
  toggleBtn.textContent = running ? "Pause" : "Start";
  timerState.textContent = running ? "Running" : remaining === SHIFT_SECONDS ? "Ready" : "Paused";
  lastTick = 0;
  if (running) frame = requestAnimationFrame(loop);
  else cancelAnimationFrame(frame);
});

resetBtn.addEventListener("click", () => {
  running = false;
  cancelAnimationFrame(frame);
  remaining = SHIFT_SECONDS;
  lastTick = 0;
  timerState.textContent = "Ready";
  toggleBtn.textContent = "Start";
  renderTimer();
});

function renderCount() {
  const n = noteEl.value.length;
  noteCount.textContent = `${n} character${n === 1 ? "" : "s"}`;
}

noteEl.value = localStorage.getItem(NOTE_KEY) || "";
renderCount();

noteEl.addEventListener("input", () => {
  localStorage.setItem(NOTE_KEY, noteEl.value);
  renderCount();
});

noteClear.addEventListener("click", () => {
  noteEl.value = "";
  localStorage.removeItem(NOTE_KEY);
  renderCount();
  noteEl.focus();
});

renderClock();
renderTimer();
setInterval(renderClock, 1000);
