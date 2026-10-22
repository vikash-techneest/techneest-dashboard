const IST_TIMEZONE = "Asia/Kolkata";

/**
 * Formats a Date object or ISO string into YYYY-MM-DD in Asia/Kolkata timezone
 */
const toISTDateString = (dateInput = new Date()) => {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: IST_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(date); // Returns YYYY-MM-DD
};

/**
 * Formats a Date object or ISO string into 12-hour time string (e.g., "09:12 AM") in Asia/Kolkata
 */
const toISTTimeString = (dateInput = new Date()) => {
  if (!dateInput) return "—";
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "—";
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: IST_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return formatter.format(date);
};

/**
 * Extracts hours and minutes (0-23, 0-59) in Asia/Kolkata timezone from a Date
 */
const getISTHoursAndMinutes = (dateInput = new Date()) => {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: IST_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const hourPart = parts.find((p) => p.type === "hour");
  const minutePart = parts.find((p) => p.type === "minute");
  const hours = parseInt(hourPart ? hourPart.value : "0", 10) % 24;
  const minutes = parseInt(minutePart ? minutePart.value : "0", 10);
  return { hours, minutes, totalMinutes: hours * 60 + minutes };
};

/**
 * Parses an "HH:mm" string (e.g. "09:30") into total minutes from midnight
 */
const parseTimeStringToMinutes = (timeStr = "09:00") => {
  const [hh, mm] = String(timeStr)
    .split(":")
    .map((v) => parseInt(v, 10) || 0);
  return hh * 60 + mm;
};

/**
 * Formats duration in minutes into "Xh Ym" (e.g., "8h 57m")
 */
const formatDurationMinutes = (totalMinutes = 0) => {
  const mins = Math.max(0, Math.round(Number(totalMinutes) || 0));
  if (mins === 0) return "0h 0m";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${String(m).padStart(2, "0")}m`;
};

/**
 * Gets the number of days and day breakdown in a given month (1-12) and year
 */
const getMonthCalendarDetails = (month, year, weeklyOffDays = [0]) => {
  const totalCalendarDays = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const days = [];
  let weeklyOffCount = 0;

  for (let d = 1; d <= totalCalendarDays; d++) {
    const dateObj = new Date(Date.UTC(year, month - 1, d));
    const dayOfWeek = dateObj.getUTCDay(); // 0 = Sun ... 6 = Sat
    const dateString = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const isWeeklyOff = weeklyOffDays.includes(dayOfWeek);
    if (isWeeklyOff) weeklyOffCount++;

    days.push({
      day: d,
      dateString,
      dayOfWeek,
      dayName: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dayOfWeek],
      isWeeklyOff,
    });
  }

  return {
    month,
    year,
    totalCalendarDays,
    weeklyOffCount,
    standardWorkingDays: totalCalendarDays - weeklyOffCount,
    days,
  };
};

module.exports = {
  IST_TIMEZONE,
  toISTDateString,
  toISTTimeString,
  getISTHoursAndMinutes,
  parseTimeStringToMinutes,
  formatDurationMinutes,
  getMonthCalendarDetails,
};
