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

It uses streams to efficiently get data from the CSV and fill the SQLite DB.

## DEMO

### CREATE CSV FILE

Please note that csv_to_sqlite is somewhat flexible regarding the input due
to the use of csv-parse.

```
cat << EOF >> /tmp/books.csv
title;author
"Dracula";"Bram Stoker"
"The Importance of Being Earnest";"Oscar Wilde"
The Picture of Dorian Gray;Oscar Wilde
EOF
```

### Run csv_to_sqlite

```
CSVPATH="/tmp/books.csv" SQLPATH="/tmp/books.db" TABLENAME="books" DELIM=";" npm start
```

### Performance

This will obviously change based on your setup (dataset, system load and harddrives).
To give at least some insight into performance:

```
# get filesize
du -h /tmp/testinput.csv
1.1G	/tmp/testinput.csv

# get number of columns
head -n1 /tmp/testinput.csv  | grep -o ";" | wc -l
53

# get number of rows 
wc -l /tmp/testinput.csv
571983 /tmp/testinput.csv

# time the import
time CSVPATH="/tmp/testinput.csv" SQLPATH="/tmp/testdatabase.db" TABLENAME="testtable" DELIM=";" npm start

real	1m40.509s
user	1m15.842s
sys	0m28.029s

```

## Lawyerly stuff

This comes without any warranty. Use at your own peril.
