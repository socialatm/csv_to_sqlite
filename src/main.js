const fileLib = require('./files');
const sqlite3 = require('sqlite3').verbose();
const dbLib = require('./db');
const parser = require('./parser');

module.exports = createDB;
async function createDB(csvFilePath, sqliteFilePath, 
			appendToSqliteDB,
			tablename, seperator) {

    let csvExists = await fileLib.fileExists(csvFilePath); 
    let sqliteExists = await fileLib.fileExists(sqliteFilePath);

    if (!csvExists) 
	throw new Error('CSVFileDoesNotExist');

    if (!appendToSqliteDB && sqliteExists)
	throw new Error('SQLFileExists');
    
    if (appendToSqliteDB) 
	throw new Error('Unimplemented');

    let db = new sqlite3.Database(sqliteFilePath, sqlite3.OPEN_CREATE | sqlite3.OPEN_READWRITE);

    // get headline, create table and prepare statement for insert
    const headArr = await parser.getHeadline(csvFilePath);
    const columnNames = await dbLib.create(db, tablename, headArr);
    const insertStmt = dbLib.createInsertStmt(db, tablename, columnNames);

    return new Promise( (resolve) => {
	// get taillines and insert into table
	parser.getTaillines(
    	    csvFilePath, 
    	    function(columnValues) {
		if (columnNames.length != columnValues.length) {
		    console.log('parseerror: ',
				columnNames, columnValues);
		    return;
		}

		insertStmt.run(columnValues);
    	    },
    	    function() {
		db.close();
		resolve()
    	    });
    });
}


