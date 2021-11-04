const moment = require("moment");

function getDateRange(dateStart, dateEnd, includeWeekend = true) {
  const diff = moment(dateEnd).diff(moment(dateStart), "days");
  const dates = [];
  for (let i = 0; i <= diff; i++) {
    const newDate = moment(dateStart).add(i, "day");
    const isWeekend = newDate.day() === 6 || newDate.day() === 0;
    if (!(!includeWeekend && isWeekend)) {
      dates.push(newDate.format("YYYY-MM-DD"));
    }
  }
  return dates;
}

module.exports = getDateRange;
