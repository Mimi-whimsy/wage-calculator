/* ==========================================================================
   Wage Calculator — script.js
   Beginner-friendly notes:
   - "Hourly Wage" section  -> saveHourlyWage() / loadHourlyWage()
   - Salary math            -> calculateSalary()
   - Manual Time card       -> getWorkHoursFromManual()
   - Work Schedule card     -> getWorkHoursFromSchedule()
   - Showing the result     -> updateResult()
   - Copy button            -> copyResult()
   - Clear button           -> clearInputs()
   ========================================================================== */

// ----- Element references -----
const hourlyWageInput = document.getElementById("hourlyWageInput");

const manualDaySegment = document.getElementById("manualDaySegment");
const hoursInput = document.getElementById("hoursInput");
const minutesInput = document.getElementById("minutesInput");
const minutesError = document.getElementById("minutesError");
const calculateManualBtn = document.getElementById("calculateManualBtn");

const scheduleDaySegment = document.getElementById("scheduleDaySegment");
const clockInInput = document.getElementById("clockInInput");
const clockOutInput = document.getElementById("clockOutInput");
const calculateScheduleBtn = document.getElementById("calculateScheduleBtn");

const resultWorkTime = document.getElementById("resultWorkTime");
const breakdown = document.getElementById("breakdown");
const regularHoursText = document.getElementById("regularHoursText");
const regularPayText = document.getElementById("regularPayText");
const overtimeRow = document.getElementById("overtimeRow");
const overtimeHoursText = document.getElementById("overtimeHoursText");
const overtimePayText = document.getElementById("overtimePayText");
const resultSalary = document.getElementById("resultSalary");

const copyBtn = document.getElementById("copyBtn");
const copiedMsg = document.getElementById("copiedMsg");
const clearBtn = document.getElementById("clearBtn");

const clearModalOverlay = document.getElementById("clearModalOverlay");
const cancelClearBtn = document.getElementById("cancelClearBtn");
const confirmClearBtn = document.getElementById("confirmClearBtn");

// ----- State that is NOT saved between visits -----
let manualDayType = "weekday";
let scheduleDayType = "weekday";
let lastSalaryText = null; // what "Copy Result" will copy

const HOURLY_WAGE_KEY = "hourlyWage";
const DEFAULT_HOURLY_WAGE = 1800;
const DEFAULT_CLOCK_IN = "09:00";
const DEFAULT_CLOCK_OUT = "18:00";

// ==========================================================================
// Hourly Wage — saved in localStorage so it survives closing the browser
// ==========================================================================

function loadHourlyWage() {
  const saved = localStorage.getItem(HOURLY_WAGE_KEY);
  hourlyWageInput.value = saved !== null ? saved : DEFAULT_HOURLY_WAGE;
}

function saveHourlyWage() {
  const value = Math.max(0, Number(hourlyWageInput.value) || 0);
  localStorage.setItem(HOURLY_WAGE_KEY, String(value));
}

hourlyWageInput.addEventListener("input", () => {
  if (Number(hourlyWageInput.value) < 0) {
    hourlyWageInput.value = 0;
  }
  saveHourlyWage();
});

// ==========================================================================
// Weekday / Weekend segmented controls (not saved — always starts on Weekday)
// ==========================================================================

function setupDaySegment(container, onChange) {
  const buttons = container.querySelectorAll(".segment");
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      buttons.forEach((b) => {
        b.classList.remove("active");
        b.setAttribute("aria-checked", "false");
      });
      button.classList.add("active");
      button.setAttribute("aria-checked", "true");
      onChange(button.dataset.value);
    });
  });
}

function resetDaySegment(container) {
  const buttons = container.querySelectorAll(".segment");
  buttons.forEach((button) => {
    const isWeekday = button.dataset.value === "weekday";
    button.classList.toggle("active", isWeekday);
    button.setAttribute("aria-checked", String(isWeekday));
  });
}

setupDaySegment(manualDaySegment, (value) => {
  manualDayType = value;
});

setupDaySegment(scheduleDaySegment, (value) => {
  scheduleDayType = value;
});

// ==========================================================================
// Salary calculation — the single source of truth for both cards
//
//   0–8 hours   -> regular rate
//   8+ hours    -> overtime rate
//   Weekday: regular x1.00, overtime x1.25
//   Weekend: regular x1.35, overtime x1.60
// ==========================================================================

function calculateSalary(hourlyWage, totalHours, dayType) {
  const regularHours = Math.min(totalHours, 8);
  const overtimeHours = Math.max(totalHours - 8, 0);

  const regularRate = dayType === "weekend" ? hourlyWage * 1.35 : hourlyWage;
  const overtimeRate = dayType === "weekend" ? hourlyWage * 1.6 : hourlyWage * 1.25;

  const regularPay = regularHours * regularRate;
  const overtimePay = overtimeHours * overtimeRate;

  return {
    regularHours,
    overtimeHours,
    regularPay,
    overtimePay,
    totalSalary: regularPay + overtimePay,
  };
}

// ----- Formatting helpers -----

function formatHoursMinutes(totalHours) {
  const hours = Math.floor(totalHours);
  const minutes = Math.round((totalHours - hours) * 60);
  return `${hours}h ${minutes}m`;
}

function formatYen(amount) {
  const rounded = Math.round(amount);
  return "¥" + rounded.toLocaleString("en-US");
}

// ==========================================================================
// Manual Time card
// ==========================================================================

function getWorkHoursFromManual() {
  minutesError.hidden = true;

  let hours = parseInt(hoursInput.value, 10);
  if (isNaN(hours) || hours < 0) hours = 0;

  let minutes = parseInt(minutesInput.value, 10);
  if (isNaN(minutes)) minutes = 0;

  if (minutes < 0 || minutes > 59) {
    minutesError.textContent = "Please enter minutes between 0 and 59.";
    minutesError.hidden = false;
    minutes = Math.min(Math.max(minutes, 0), 59);
  }

  return hours + minutes / 60;
}

calculateManualBtn.addEventListener("click", () => {
  const totalHours = getWorkHoursFromManual();
  updateResult(totalHours, manualDayType);
});

// ==========================================================================
// Work Schedule card
// Overnight shifts (Clock Out earlier than or equal to Clock In) count as
// ending the following day — e.g. 22:00 -> 06:00 is treated as 8 hours.
// ==========================================================================

function getWorkHoursFromSchedule() {
  const clockInValue = clockInInput.value;
  const clockOutValue = clockOutInput.value;

  if (!clockInValue || !clockOutValue) {
    return 0;
  }

  const [inHours, inMinutes] = clockInValue.split(":").map(Number);
  const [outHours, outMinutes] = clockOutValue.split(":").map(Number);

  const startMinutes = inHours * 60 + inMinutes;
  let endMinutes = outHours * 60 + outMinutes;

  if (endMinutes <= startMinutes) {
    endMinutes += 24 * 60; // shift ends the next day
  }

  return (endMinutes - startMinutes) / 60;
}

calculateScheduleBtn.addEventListener("click", () => {
  const totalHours = getWorkHoursFromSchedule();
  updateResult(totalHours, scheduleDayType);
});

// ==========================================================================
// Result card
// ==========================================================================

function updateResult(totalHours, dayType) {
  const hourlyWage = Math.max(0, Number(hourlyWageInput.value) || 0);
  const result = calculateSalary(hourlyWage, totalHours, dayType);

  resultWorkTime.textContent = formatHoursMinutes(totalHours);

  regularHoursText.textContent = formatHoursMinutes(result.regularHours);
  regularPayText.textContent = formatYen(result.regularPay);

  const hasOvertime = result.overtimeHours > 0;
  overtimeRow.hidden = !hasOvertime;
  if (hasOvertime) {
    overtimeHoursText.textContent = formatHoursMinutes(result.overtimeHours);
    overtimePayText.textContent = formatYen(result.overtimePay);
  }

  breakdown.hidden = false;

  const salaryText = formatYen(result.totalSalary);
  resultSalary.textContent = salaryText;
  lastSalaryText = salaryText;

  copyBtn.disabled = false;
}

// ==========================================================================
// Copy Result
// ==========================================================================

function copyResult() {
  if (!lastSalaryText) return;

  const showCopiedMessage = () => {
    copiedMsg.hidden = false;
    setTimeout(() => {
      copiedMsg.hidden = true;
    }, 1800);
  };

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(lastSalaryText).then(showCopiedMessage).catch(() => {
      fallbackCopy(lastSalaryText);
      showCopiedMessage();
    });
  } else {
    fallbackCopy(lastSalaryText);
    showCopiedMessage();
  }
}

// Fallback for older browsers without the Clipboard API
function fallbackCopy(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  try {
    document.execCommand("copy");
  } catch (err) {
    // Copying failed silently — nothing more we can do without a permissions prompt.
  }
  document.body.removeChild(textarea);
}

copyBtn.addEventListener("click", copyResult);

// ==========================================================================
// Clear (with confirmation dialog)
// ==========================================================================

clearBtn.addEventListener("click", () => {
  clearModalOverlay.hidden = false;
});

cancelClearBtn.addEventListener("click", () => {
  clearModalOverlay.hidden = true;
});

confirmClearBtn.addEventListener("click", () => {
  clearInputs();
  clearModalOverlay.hidden = true;
});

function clearInputs() {
  // Manual Time
  hoursInput.value = "";
  minutesInput.value = "";
  minutesError.hidden = true;
  manualDayType = "weekday";
  resetDaySegment(manualDaySegment);

  // Work Schedule
  clockInInput.value = DEFAULT_CLOCK_IN;
  clockOutInput.value = DEFAULT_CLOCK_OUT;
  scheduleDayType = "weekday";
  resetDaySegment(scheduleDaySegment);

  // Result
  resultWorkTime.textContent = "0h 0m";
  regularHoursText.textContent = "0h 0m";
  regularPayText.textContent = "¥0";
  overtimeRow.hidden = true;
  resultSalary.textContent = "¥0";
  breakdown.hidden = true;

  copyBtn.disabled = true;
  lastSalaryText = null;

  // Hourly Wage is intentionally left untouched.
}

// ==========================================================================
// Startup
// ==========================================================================

loadHourlyWage();

// Register the service worker so the app can be added to the Home Screen
// and works offline. If this fails (e.g. running from file://), the app
// still works fine as a normal webpage.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {
      /* offline support just won't be available — not a fatal error */
    });
  });
}
