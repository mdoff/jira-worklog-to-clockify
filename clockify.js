const fetch = require("node-fetch");
const moment = require("moment");
const {
  clockifyProject,
  clockifyKey,
  clockifyWorkspace,
  defaultStartTime,
} = require("./config.json");

async function clockifyAdd(clockifyStart, clockifyEnd, description) {
  const uri = `https://api.clockify.me/api/v1/workspaces/${clockifyWorkspace}/time-entries`;
  const body = JSON.stringify({
    projectId: clockifyProject,
    start: clockifyStart,
    end: clockifyEnd,
    billable: true,
    description,
  });

  const response = await fetch(encodeURI(uri), {
    headers: { "X-Api-Key": clockifyKey, "Content-Type": "application/json" },
    method: "POST",
    body,
  });
  return await response.json();
}

function generateClockifyEntry(worklog) {
  const date = moment(worklog.date).add(defaultStartTime, "hours");
  const dateEnd = moment(worklog.date)
    .add(defaultStartTime, "hours")
    .add(worklog.time, "seconds");
  return {
    description: worklog.keys,
    start: date.toISOString(),
    end: dateEnd.toISOString(),
  };
}

async function importFromWorklog(worklogs) {
  const entries = worklogs.map(generateClockifyEntry);
  return await Promise.all(
    entries.map(async (entry) => {
      return await clockifyAdd(entry.start, entry.end, entry.description);
    })
  );
}

module.exports = importFromWorklog;
