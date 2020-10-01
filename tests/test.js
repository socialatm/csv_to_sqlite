const assert = require('assert');
const fs = require('fs');


// TODO make this filename random
function getRandomFilename(purpose) {
    return '/tmp/' + purpose;
}

// TODO handle errors
function unlinkError(err) {
    if (err) {
	console.log('FATAL UNLINK ERROR');
    }
}

describe('File library', function() {
    const fileLib = require('../src/files');

    it('should correctly identify when a file exists', async function() {
	const existsPath = getRandomFilename('justneedstoexist');
	fs.writeFileSync(existsPath, '');
	let ret = await fileLib.fileExists(existsPath);
	fs.unlink(existsPath, unlinkError);

        assert.equal(ret, true);
    });

    it('should correctly identify when a file does not exist ', async function() {
    	const nonExistingPath = getRandomFilename('justneedsnottoexist');
	let ret = await fileLib.fileExists(nonExistingPath);
	assert.equal(ret, false);
    });
    
    it('should read headline of file', async function() {
	const existsPath = getRandomFilename('justneedstoexist');
	fs.writeFileSync(existsPath, '0\n1\n2');
	let headline = await fileLib.getHeadline(existsPath);
	assert.equal('0', headline);
	fs.unlink(existsPath, unlinkError);

    });

    it('should read headline of file', function(done) {
    	const existsPath = getRandomFilename('justneedstoexist');
    	fs.writeFileSync(existsPath, '0\n1\n2');
	let lines = []
    	fileLib.getTaillines(existsPath, 
    			     function(line) {
    				 lines.push(line);
    			     },
    			     function() {
    				 assert.equal(lines[0], '1');
    				 assert.equal(lines[1], '2');
    				 done();
    			     });
    });
});

describe('Database creation', function() {
    const dbLib = require('../src/db');

    it('should create correct create sql', function() {
	dbLib.create(
	    {
		run: function(sql) {
		    assert.equal('CREATE TABLE testtable ('+
				 'field1 text,'+
				 'field2 text'+
				 ')',
				 sql
				);
		}
	    },
	    'testtable',
	    ['field1', 'field2']
	);
    });

    it('should create correct insert prepared stmt', function(done) {
	const sqlite3 = require('sqlite3').verbose()
	const db = new sqlite3.Database(':memory:');

	db.run('CREATE TABLE cooltable (field1 text, field2 text)', function() {
	    stmt = dbLib.createInsertStmt(db, 'cooltable', ['field1', 'field2']);
	    assert.equal('INSERT INTO cooltable (field1,field2) '+
			 'VALUES (?,?)',
			 stmt.sql);
	    done();
	});
    });
});
    

describe('Overall', function() {
    const run = require('../src/run');

    const csvPath = getRandomFilename('csvpath');
    const sqlitePath = getRandomFilename('sqlitepath');

    it('should not overwrite an existing sqlite3 file if append is not requested', 
       async function() {

	   fs.writeFileSync(sqlitePath, '');
	   fs.writeFileSync(csvPath, '');
	   var errorWasCorrect = false;

	   try { 
	       await run(csvPath, sqlitePath, false);
	   } catch(e) {
	       if(e.message === 'SQLFileExists') 
		   errorWasCorrect = true;
	   }
	   finally {
	       fs.unlink(sqlitePath, unlinkError);
	       fs.unlink(csvPath, unlinkError);

	   }
	   assert.ok(errorWasCorrect);
       });

    it('should recognize non existing csv', 
       async function() {
    	   let errorWasCorrect = false;
	   fs.writeFileSync(sqlitePath, '');
    	   try { 
    	       await run(csvPath+'1', sqlitePath, true);
    	   } catch(e) {
    	       if(e.message === 'CSVFileDoesNotExist') 
		   errorWasCorrect = true
    	   }
	   finally {
	       fs.unlink(sqlitePath, unlinkError);
	   }
    	   assert.ok(errorWasCorrect);
       });

    // it('should create the sqlite3', async function() {
    // 	let csvPath = '/home/user/work/csv_to_sqlite3/testinput/testinput.csv';
    // 	let sqlitePath = '/home/user/work/csv_to_sqlite3/testinput/testinput.db';
    // 	await run(csvPath, sqlitePath, 
    // 		  false,
    // 		  'cooltable', '|'
    // 		 );
    // 	fs.unlink(sqlitePath, unlinkError);
    // });

});
