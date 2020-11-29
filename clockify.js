const fetch = require("node-fetch");
const moment = require("moment");

async function clockifyAdd(clockifyStart, clockifyEnd, description, config) {
  const uri = `https://api.clockify.me/api/v1/workspaces/${config.clockifyWorkspace}/time-entries`;
  const body = JSON.stringify({
    projectId: config.clockifyProject,
    start: clockifyStart,
    end: clockifyEnd,
    billable: true,
    description,
  });

  const response = await fetch(encodeURI(uri), {
    headers: {
      "X-Api-Key": config.clockifyKey,
      "Content-Type": "application/json",
    },
    method: "POST",
    body,
  });
  return await response.json();
}

function generateClockifyEntry(worklog, defaultStartTime) {
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

async function importFromWorklog(worklogs, config) {
  const entries = worklogs.map((worklog) =>
    generateClockifyEntry(worklog, config.defaultStartTime)
  );
  return await Promise.all(
    entries.map(async (entry) => {
      return await clockifyAdd(
        entry.start,
        entry.end,
        entry.description,
        config
      );
    })
  );
}

module.exports = importFromWorklog;
