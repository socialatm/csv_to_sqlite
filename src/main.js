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

    let db = new sqlite3.Database(sqliteFilePath, sqlite3.OPEN_CREATE | sqlite3.OPEN_READWRITE);

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
		await new Promise( (resolveInsert) => {
		    insertStmt.run(columnValues, function() {
			openInserts -= 1;
			resolveInsert();
		    });
		});
		if (closed && openInserts == 0) {
		    resolve();
		}
    	    },
    	    function() {
		closed = true;
		if (closed && openInserts == 0) {
		    resolve();
		}
    	    });
    });
}


