const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function isLeapYear(year) {
  return year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0);
}

function isValidDateString(value) {
  if (typeof value !== "string") {
    return false;
  }

  const match = DATE_PATTERN.exec(value);

  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (year < 1000 || year > 9999 || month < 1 || month > 12) {
    return false;
  }

  const daysInMonth = [
    31,
    isLeapYear(year) ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];

  return day >= 1 && day <= daysInMonth[month - 1];
}

function normalizeScheduledDate(value) {
  if (value === null) {
    return { isValid: true, value: null };
  }

  if (typeof value !== "string") {
    return { isValid: false, value: null };
  }

  const trimmedValue = value.trim();

  if (trimmedValue === "") {
    return { isValid: true, value: null };
  }

  if (!isValidDateString(trimmedValue)) {
    return { isValid: false, value: null };
  }

  return { isValid: true, value: trimmedValue };
}

function getCalendarMonthRange(yearValue, monthValue) {
  const yearText = typeof yearValue === "string" ? yearValue : "";
  const monthText = typeof monthValue === "string" ? monthValue : "";

  if (!/^\d{4}$/.test(yearText) || !/^\d{1,2}$/.test(monthText)) {
    return null;
  }

  const year = Number(yearText);
  const month = Number(monthText);

  // 다음 달 시작일을 항상 유효한 MySQL DATE로 만들 수 있는 범위
  if (year < 1000 || year > 9998 || month < 1 || month > 12) {
    return null;
  }

  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const nextYear = month === 12 ? year + 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  const endDate = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;

  return { startDate, endDate };
}

module.exports = {
  getCalendarMonthRange,
  isValidDateString,
  normalizeScheduledDate,
};
