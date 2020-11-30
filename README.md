# Jira worklog to Clockify

By default script will search for config file in `./config.json` path.

```
Usage: index.js [options]

        --help, -h
                Displays help information about this script
                'index.js -h' or 'index.js --help'

        --start, -s
                Defines starting date (required)
                'node src/index.js --start=2020-11-20' or 'node src/index.js -s 2020-11-20'

        --end, -e
                Defines end date (optional)
                'node src/index.js --end=2020-11-20' or 'node src/index.js -e 2020-11-20'

        --config, -c
                Path to configuration file, default value: config.json (optional)
                'node src/index.js --config=some-file.json' or 'node src/index.js -c some-file.json'

        --test, -t
                Only fetch worklogs without saving them (optional)
                'node src/index.js --test' or 'node src/index.js -t'
```