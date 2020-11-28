const fetch = require("node-fetch");
const moment = require("moment");
const { jiraURL, jiraProject, jiraToken, jiraEmail } = require("./config.json");

async function fetchJira(uri) {
  const data = await fetch(encodeURI(uri), {
    headers: {
      Accept: "application/json",
      "X-Atlassian-Token": "no-check",
      Authorization: `Basic ${Buffer.from(`${jiraEmail}:${jiraToken}`).toString(
        "base64"
      )}`,
    },
    method: "GET",
  });
  return await data.json();
}

async function fetchTimeLogs(start, end, accountId) {
  const searchUri = `${jiraURL}/rest/api/2/search?fields=project,issuetype,resolution,summary,priority,status,parent,issuelinks,worklog,customfield_10013,customfield_10015,workeduser,customfield_10020,customfield_10026&maxResults=3000&jql=project="${jiraProject}" and worklogDate >= "${start}" and worklogDate <= "${end}" and worklogAuthor in ("${accountId}")&startAt=0`;
  const data = await fetchJira(searchUri);
  const additional = data.issues.filter(
    (issue) => issue.fields.worklog.total > issue.fields.worklog.maxResults
  );
  const baseIssues = data.issues.filter(
    (issue) => issue.fields.worklog.total <= issue.fields.worklog.maxResults
  );
  const newIssues = await Promise.all(
    additional.map(async ({ key, self }) => {
      const data = await fetchJira(`${self}/worklog`);
      return { key, fields: { worklog: data } };
    })
  );

  return { issues: [...baseIssues, ...newIssues] };
}

function getWorklogsFromIssues(issues, accountId) {
  return issues.flatMap((issue) =>
    issue.fields.worklog.worklogs
      .filter((worklog) => worklog.author.accountId === accountId)
      .map((worklog) => ({
        key: issue.key,
        started: worklog.started,
        timeSpent: worklog.timeSpent,
        timeSpentSeconds: worklog.timeSpentSeconds,
      }))
  );
}

function getTimeLogForDate(worklogs, date) {
  return worklogs.filter(
    (worklog) => moment(worklog.started).format("YYYY-MM-DD") === date
  );
}

function reduceTimeLog(worklogs) {
  const { keys, time } = worklogs.reduce(
    (acc, worklog) => {
      return {
        time: acc.time + worklog.timeSpentSeconds,
        keys: [...acc.keys, worklog.key],
      };
    },
    { keys: [], time: 0 }
  );
  return { keys: keys.join(", "), time };
}

function getDateRange(dateStart, dateEnd) {
  const diff = moment(dateEnd).diff(moment(dateStart), "days");
  const dates = [];
  for (let i = 0; i <= diff; i++) {
    dates.push(moment(dateStart).add(i, "day").format("YYYY-MM-DD"));
  }
  return dates;
}

async function getWorklogs(dateStart, dateEnd) {
  const { accountId } = await fetchJira(`${jiraURL}/rest/api/3/myself`);
  const data = await fetchTimeLogs(dateStart, dateEnd, accountId);
  const dates = getDateRange(dateStart, dateEnd);
  const rawWorklogs = getWorklogsFromIssues(data.issues, accountId);

  return dates.map((date) => ({
    ...reduceTimeLog(getTimeLogForDate(rawWorklogs, date)),
    date,
  }));
}

module.exports = getWorklogs;
