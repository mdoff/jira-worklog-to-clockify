const argv = require("argv");
const moment = require("moment");

const clockifyImport = require("./clockify");
const jiraWorklogs = require("./jira");

/**
 * @param {string} dateStart  - date in YYYY-MM-DD format
 * @param {string} dateEnd - date in YYYY-MM-DD format
 * @param {string} config - path to config file
 */
async function main(dateStart, dateEnd, config = "../config.json") {
  const configFile = require(config);
  const worklogs = await jiraWorklogs(dateStart, dateEnd, configFile);
  const clockData = await clockifyImport(worklogs, configFile);

  clockData.forEach((clockifyEntry) => {
    console.log(
      `${moment(clockifyEntry.timeInterval.start).format("YYYY-MM-DD")} ${
        clockifyEntry.timeInterval.duration
      } ${clockifyEntry.description}`
    );
  });
}

argv.type("date", function (value) {
  const date = moment(value);
  if (date.isValid()) {
    return date.format("YYYY-MM-DD");
  } else {
    return false;
  }
});

const { options } = argv
  .option([
    {
      name: "start",
      short: "s",
      type: "date",
      description: "Defines starting date (required)",
      example: "'node index.js --start=2020-11-20' or 'node index.js -s 2020-11-20'",
    },
    {
      name: "end",
      short: "e",
      type: "date",
      description: "Defines end date (optional)",
      example: "'node index.js --end=2020-11-20' or 'node index.js -e 2020-11-20'",
    },
    {
      name: "config",
      short: "c",
      type: "path",
      description: "Path to configuration file, default value: config.json (optional)",
      example: "'node index.js --config=some-file.json' or 'node index.js -c some-file.json'",
    },
  ])
  .run();

if (options.start) {
  main(
    options.start,
    options.end ? options.end : options.start,
    options.config
  );
} else {
  console.log("--start (-s) option is required");
}
