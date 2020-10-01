const fileLib = require('./files');
const sqlite3 = require('sqlite3').verbose();
const dbLib = require('./db');

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

    let db = new sqlite3.Database(sqliteFilePath);

    db.serialize(async function() {

	// create table
	let headline = await fileLib.getHeadline(csvFilePath);
    	const headFields = headline.split(seperator);
    	const fieldNames = await dbLib.create(db, tablename, headFields);

	// create insert statement for all coming inserts
	const insertStmt = dbLib.createInsertStmt(db, tablename, fieldNames);

	// insert into table
	db.parallelize(function() {
	    fileLib.getTaillines(
    		csvFilePath, 
    		function(line) {
		    console.log('TAIL LINE :',line);
    		    const fields = line.split(seperator);

		    if (fields.length != headFields.length) {
			// TODO put these lines in different csv document
			console.log('parseerror: ',
				    fields.length, headFields.length, line);
			return;
		    }

		    insertStmt.run(fields);
    		},
    		function() {
		    // TODO create indices 
    		});
	});
    });
}


