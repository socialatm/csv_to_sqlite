const assert = require('assert');
const fs = require('fs');


// TODO make this filename random
function getRandomFilename(purpose) {
    return '/tmp/' + purpose;
}

// TODO handle errors
function unlinkError(err) {
    if (err) {
	console.log('TEST COULD NOT DELETE TEST FILES');
    }
}

describe('File library', function() {
    const fileLib = require('../src/files');

    it('should correctly identify when a file exists', async function() {
	const existsPath = getRandomFilename('justneedstoexist');
	fs.writeFileSync(existsPath, '');
	let exists = await fileLib.fileExists(existsPath);
	if (exists) fs.unlink(existsPath, unlinkError);
        assert.equal(exists, true);
    });

    it('should correctly identify when a file does not exist ', async function() {
    	const nonExistingPath = getRandomFilename('justneedsnottoexist');
	let ret = await fileLib.fileExists(nonExistingPath);
	assert.equal(ret, false);
    });
});

describe('Parser', function() {
    const parser = require('../src/parser');

    it('should parse file', function(done) {
	// create test filen
	const existsPath = getRandomFilename('justneedstoexist');
	fs.writeFileSync(existsPath, 
			 'h1;h 2;h()((((3\n'+ // malformed header
			 'r11;r12;r13\n'+ // first content row
			 'r21;r22;r23'); // second content row

	// read transfomer the data
	let parserProduced = [];
	const parsedstream = parser(existsPath, ";");
	parsedstream.on('data', 
			function(data) { 
			    parserProduced.push(data);
			});

	parsedstream.on('end', function() {
	    assert.deepEqual(parserProduced,
			     [
				 ['h1', 'h2', 'h3'],
				 ['r11', 'r12', 'r13'],
				 ['r21', 'r22', 'r23'],
			     ]);
	    fs.unlink(existsPath, unlinkError);
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
    const sqlite3 = require('sqlite3').verbose();
    const main = require('../src/main');

    const csvPath = getRandomFilename('csvpath');
    const sqlitePath = getRandomFilename('sqlitepath');

    it('should not overwrite an existing sqlite3 file if append is not requested', 
       async function() {

	   fs.writeFileSync(sqlitePath, '');
	   fs.writeFileSync(csvPath, '');
	   var errorWasCorrect = false;

	   try { 
	       await main(csvPath, sqlitePath, false);
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
    	       await main(csvPath+'1', sqlitePath, true);
    	   } catch(e) {
    	       if(e.message === 'CSVFileDoesNotExist') 
		   errorWasCorrect = true
    	   }
	   finally {
	       fs.unlink(sqlitePath, unlinkError);
	   }
    	   assert.ok(errorWasCorrect);
       });

    it('should create the sqlite3', async function() {
    	let csvPath = '/tmp/t.csv';
    	let sqlitePath = '/tmp/t.db';
	
    	fs.writeFileSync(csvPath, 'first name;secondname;pa$/$/$/rty\n'+
    			 'Gerhard;Schröder;SPD\n'+
    			 'Angela;Merkel;CDU');
    	await main(
    	    csvPath, sqlitePath, 
    	    false,
    	    'cooltable', ';'
    	);

	const db = new sqlite3.Database(sqlitePath);
	await new Promise( (resolve) => {
	    db.all("select * from cooltable", function(err, allrows) {
		const wanted = [
		    { firstname: 'Gerhard', secondname: 'Schröder', party: 'SPD' },
		    { firstname: 'Angela', secondname: 'Merkel', party: 'CDU' }
		];
		assert.deepEqual(allrows, wanted);
		resolve();
	    });
	});

    	fs.unlink(sqlitePath, unlinkError);
    	fs.unlink(csvPath, unlinkError);
    });

});
