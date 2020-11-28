const clockifyImport = require("./clockify");
const jiraWorklogs = require("./jira");

const dateStart = `2020-11-27`;
const dateEnd = `2020-11-27`;

async function main() {
  const worklogs = await jiraWorklogs(dateStart, dateEnd);
  // const clockData = await clockifyImport(worklogs);

  console.log({ worklogs });
}

main();
