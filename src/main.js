const fileLib = require('./files');
const sqlite3 = require('sqlite3').verbose();
const dbLib = require('./db');
const parser = require('./parser');

module.exports = createDB;
async function createDB(csvFilePath, sqliteFilePath, 
			appendToSqliteDB,
			tablename, separator) {

    let csvExists = await fileLib.fileExists(csvFilePath); 
    let sqliteExists = await fileLib.fileExists(sqliteFilePath);

    if (!csvExists) 
	throw new Error('CSVFileDoesNotExist');

    if (!appendToSqliteDB && sqliteExists)
	throw new Error('SQLFileExists');
    
    if (appendToSqliteDB) 
	throw new Error('Unimplemented');

    let db = new sqlite3.Database(sqliteFilePath);

    // get headline, create table and prepare statement for insert
    const headArr = await parser.getHeadline(csvFilePath, separator);
    const columnNames = await dbLib.create(db, tablename, headArr);
    const insertStmt = dbLib.createInsertStmt(db, tablename, columnNames);


    
    let closed = false;
    let openInserts = 0;
    await new Promise( (resolve) => {
	parser.getTaillines(
    	    csvFilePath, 
	    separator,
    	    async function(columnValues) {
		if (columnNames.length != columnValues.length) {
		    console.log('parseerror: ', columnNames, columnValues);
		    return;
		}

		openInserts += 1;
		insertStmt.run(columnValues, function() {
		    openInserts -= 1;
		    if (closed && openInserts == 0) {
			resolve();
		    }
		});
    	    },
    	    function() {
		closed = true;
		if (closed && openInserts == 0) {
		    resolve();
		}
    	    });
    });
}


class InsertStream extends Writable {
    constructor(db, tablename) {
	super({highWaterMark: 5, objectMode: true})
	this.db = db;
	this.insertStmt = false,
	this.tablename = tablename;
    }
    async _write(splits, encoding, next) {
	// first result creates table
	if (!this.insertStmt) {
	    this.insertStmt = await this.create(splits);
	}
	// other results insert into table
	else {
	    await this.insert(splits);
	}
	next();
    }
    async create(columns) {
	await dbLib.create(this.db, this.tablename, columns);
	return dbLib.createInsertStmt(this.db, this.tablename, columns);
    }
    async insert(values) {
	await new Promise( (resolve) => {
	    this.insertStmt.run(values, resolve);
	});
    }
}
