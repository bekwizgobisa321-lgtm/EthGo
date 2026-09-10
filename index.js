
/* --------------------------------------------------------- 
   1. STATIC DATA 
--------------------------------------------------------- */

const ETHIOPIAN_MONTHS = [ 
  "Meskerem", "Tikimt", "Hidar", "Tahsas", "Tir", "Yekatit", 
  "Megabit", "Miazia", "Ginbot", "Sene", "Hamle", "Nahase", "Pagume" 
]; 

const GREGORIAN_MONTHS = [ 
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December" 
]; 

const ETHIOPIAN_YEAR_RANGE = { start: 2008, end: 2025 }; 
const GREGORIAN_YEAR_RANGE = { start: 2015, end: 2033 }; 


/* --------------------------------------------------------- 
   2. LEAP YEAR HELPERS 
--------------------------------------------------------- */

function isGregorianLeap(year) { 
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0; 
} 

function isEthiopianLeap(year) { 
  return year % 4 === 3; 
} 


/* --------------------------------------------------------- 
   3. FIND ETHIOPIAN NEW YEAR IN THE GREGORIAN CALENDAR 
--------------------------------------------------------- */

function ethiopianNewYearInGregorian(ethiopianYear) { 
  const gregorianYear = ethiopianYear + 7; 
  const newYearDay = isGregorianLeap(gregorianYear + 1) ? 12 : 11; 

  return new Date(gregorianYear, 8, newYearDay); 
} 


/* --------------------------------------------------------- 
   4. DAYS-IN-MONTH HELPERS 
--------------------------------------------------------- */

function daysInEthiopianMonth(monthNumber, ethiopianYear) { 
  if (monthNumber === 13) { 
    return isEthiopianLeap(ethiopianYear) ? 6 : 5; 
  } 

  return 30; 
} 

function daysInGregorianMonth(monthNumber, gregorianYear) { 
  return new Date(gregorianYear, monthNumber, 0).getDate(); 
} 


/* --------------------------------------------------------- 
   5. THE ACTUAL CONVERSIONS 
--------------------------------------------------------- */

function ethiopianToGregorian(ethYear, ethMonth, ethDay) { 
  const newYear = ethiopianNewYearInGregorian(ethYear); 
  const dayOffset = (ethMonth - 1) * 30 + (ethDay - 1); 

  const result = new Date(newYear); 
  result.setDate(result.getDate() + dayOffset); 

  return result; 
} 

function gregorianToEthiopian(gregYear, gregMonth, gregDay) { 
  const gregDate = new Date(gregYear, gregMonth - 1, gregDay); 

  let ethYear = gregYear - 7; 
  let newYear = ethiopianNewYearInGregorian(ethYear); 

  if (gregDate < newYear) { 
    ethYear = gregYear - 8; 
    newYear = ethiopianNewYearInGregorian(ethYear); 
  } 

  const msPerDay = 1000 * 60 * 60 * 24; 
  const dayOffset = Math.round((gregDate - newYear) / msPerDay); 

  const ethMonth = Math.floor(dayOffset / 30) + 1; 
  const ethDay = (dayOffset % 30) + 1; 

  return { year: ethYear, month: ethMonth, day: ethDay }; 
} 


/* --------------------------------------------------------- 
   6. GRAB ALL THE DOM ELEMENTS WE NEED 
--------------------------------------------------------- */

const ethYearSelect = document.getElementById("eth-year"); 
const ethMonthSelect = document.getElementById("eth-month"); 
const ethDaySelect = document.getElementById("eth-day"); 

const gregYearSelect = document.getElementById("greg-year"); 
const gregMonthSelect = document.getElementById("greg-month"); 
const gregDaySelect = document.getElementById("greg-day"); 

const toGregorianBtn = document.getElementById("convert-to-gregorian"); 
const toEthiopianBtn = document.getElementById("convert-to-ethiopian"); 

const resultEl = document.getElementById("conversion-result"); 


/* --------------------------------------------------------- 
   7. DROPDOWN-FILLING HELPERS 
--------------------------------------------------------- */

function fillSelect(selectEl, items, selectedValue) { 
  selectEl.innerHTML = ""; 

  items.forEach(({ value, label }) => { 
    const option = document.createElement("option"); 
    option.value = value; 
    option.textContent = label; 

    if (String(value) === String(selectedValue)) { 
      option.selected = true; 
    } 

    selectEl.appendChild(option); 
  }); 
} 

function numberRange(start, end) { 
  const items = []; 

  for (let n = start; n <= end; n++) { 
    items.push({ value: n, label: String(n) }); 
  } 

  return items; 
} 

function monthOptions(monthNames) { 
  return monthNames.map((name, index) => ({ 
    value: index + 1, 
    label: name 
  })); 
} 

function refreshEthiopianDays() { 
  const year = Number(ethYearSelect.value); 
  const month = Number(ethMonthSelect.value); 
  const totalDays = daysInEthiopianMonth(month, year); 
  const previouslySelected = ethDaySelect.value; 

  fillSelect(ethDaySelect, numberRange(1, totalDays), previouslySelected); 
} 

function refreshGregorianDays() { 
  const year = Number(gregYearSelect.value); 
  const month = Number(gregMonthSelect.value); 
  const totalDays = daysInGregorianMonth(month, year); 
  const previouslySelected = gregDaySelect.value; 

  fillSelect(gregDaySelect, numberRange(1, totalDays), previouslySelected); 
} 


/* --------------------------------------------------------- 
   8. INITIAL SETUP — BUILD EVERY DROPDOWN ON PAGE LOAD 
--------------------------------------------------------- */

function initDropdowns() { 
  fillSelect(
    ethYearSelect, 
    numberRange(ETHIOPIAN_YEAR_RANGE.start, ETHIOPIAN_YEAR_RANGE.end), 
    2018
  ); 

  fillSelect(
    gregYearSelect, 
    numberRange(GREGORIAN_YEAR_RANGE.start, GREGORIAN_YEAR_RANGE.end), 
    2026
  ); 

  fillSelect(ethMonthSelect, monthOptions(ETHIOPIAN_MONTHS), 12); 
  fillSelect(gregMonthSelect, monthOptions(GREGORIAN_MONTHS), 8); 

  refreshEthiopianDays(); 
  refreshGregorianDays(); 

  ethYearSelect.addEventListener("change", refreshEthiopianDays); 
  ethMonthSelect.addEventListener("change", refreshEthiopianDays); 

  gregYearSelect.addEventListener("change", refreshGregorianDays); 
  gregMonthSelect.addEventListener("change", refreshGregorianDays); 
} 


/* --------------------------------------------------------- 
   9. BUTTON HANDLERS 
--------------------------------------------------------- */

toGregorianBtn.addEventListener("click", () => { 
  const ethYear = Number(ethYearSelect.value); 
  const ethMonth = Number(ethMonthSelect.value); 
  const ethDay = Number(ethDaySelect.value); 

  const gregorianDate = ethiopianToGregorian(ethYear, ethMonth, ethDay); 

  const monthLabel = GREGORIAN_MONTHS[gregorianDate.getMonth()]; 
  const ethMonthLabel = ETHIOPIAN_MONTHS[ethMonth - 1]; 

  resultEl.textContent = 
    `${ethDay} ${ethMonthLabel} ${ethYear} is ${monthLabel} ${gregorianDate.getDate()}, ${gregorianDate.getFullYear()}`; 
}); 

toEthiopianBtn.addEventListener("click", () => { 
  const gregYear = Number(gregYearSelect.value); 
  const gregMonth = Number(gregMonthSelect.value); 
  const gregDay = Number(gregDaySelect.value); 

  const { year, month, day } = gregorianToEthiopian(gregYear, gregMonth, gregDay); 

  const gregMonthLabel = GREGORIAN_MONTHS[gregMonth - 1]; 
  const ethMonthLabel = ETHIOPIAN_MONTHS[month - 1]; 

  resultEl.textContent = 
    `${gregMonthLabel} ${gregDay}, ${gregYear} is ${day} ${ethMonthLabel} ${year}`; 
}); 


/* --------------------------------------------------------- 
   10. RUN EVERYTHING ONCE THE PAGE IS READY 
--------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", initDropdowns);
