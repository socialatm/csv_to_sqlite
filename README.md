# csv_to_sqlite

## Purpose

Turns your CSV file into a SQLite database

All it needs to work is:
* somewhat recent version of node (oldest tested version v10.15.0)
* sqlite3 npm package (npm install after cloning this repo)
* csv-parse npm package

What it needs to start:
* a path to a csv file
* a path to a sqlite3 file
* the information an the used delimiter
* the soon to be created tablename

It uses streams to efficiently get data from the CSV and fill the SQLITE DB.

## DEMO

### CREATE CSV FILE

```
cat << EOF >> /tmp/csv_file.db

TODO: TESTDATA HERE!

EOF
```


### Run csv_to_sqlite

```
CSVPATH="/tmp/csv_file.db" SQLPATH="/tmp/database.db" TABLENAME="books" DELIM=";" npm start
```

### Performance

TODO: Show performance sample of realworld db


## MISC

### Memory profiling (inspect running program)

Change package.json:

* OLD 
  "start": "node src/run.js"
* NEW 
  "start": "node --inspect src/run.js"

Do not forget to revert your changes for production!

## Lawyerly stuff

This comes without any warranty. Use at your own peril.
