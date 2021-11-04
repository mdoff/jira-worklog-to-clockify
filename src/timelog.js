const getDateRange = require("./getDateRange");

function generateTimeLog(dateStart, dateEnd, workTime) {
  const dates = getDateRange(dateStart, dateEnd, false);
  const worklogs = dates.map((date) => ({
    keys: "",
    time: workTime,
    date,
  }));

  return worklogs;
}

module.exports = generateTimeLog;
