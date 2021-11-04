const argv = require("argv");
const moment = require("moment");

const clockifyImport = require("./clockify");
const jiraWorklogs = require("./jira");
const timelog = require("./timelog");

/**
 * @param {string} dateStart  - date in YYYY-MM-DD format
 * @param {string} dateEnd - date in YYYY-MM-DD format
 * @param {string} config - path to config file
 */
async function main(
  dateStart,
  dateEnd,
  config = "../config.json",
  test = false
) {
  const configFile = require(config);
  const worklogs = configFile.jiraToken ? await jiraWorklogs(dateStart, dateEnd, configFile) : timelog(dateStart, dateEnd, configFile.defaultWorkTime);

  if (test) {
    console.log(worklogs);
    return;
  }

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
      example:
        "'node src/index.js --start=2020-11-20' or 'node src/index.js -s 2020-11-20'",
    },
    {
      name: "end",
      short: "e",
      type: "date",
      description: "Defines end date (optional)",
      example:
        "'node src/index.js --end=2020-11-20' or 'node src/index.js -e 2020-11-20'",
    },
    {
      name: "config",
      short: "c",
      type: "path",
      description:
        "Path to configuration file, default value: config.json (optional)",
      example:
        "'node src/index.js --config=some-file.json' or 'node src/index.js -c some-file.json'",
    },
    {
      name: "test",
      short: "t",
      type: "bool",
      description: "Only fetch worklogs without saving them (optional)",
      example: "'node src/index.js --test' or 'node src/index.js -t'",
    },
  ])
  .run();

if (options.start) {
  main(
    options.start,
    options.end ? options.end : options.start,
    options.config,
    options.test
  );
} else {
  console.log("--start (-s) option is required");
}
