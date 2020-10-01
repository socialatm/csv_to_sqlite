const run = require('./run');

async function main() {
    let csvPath = '/home/user/work/csv_to_sqlite3/testinput/testinput.csv';
    let sqlitePath = '/home/user/work/csv_to_sqlite3/testinput/testinput.db';
    await run(csvPath, sqlitePath, 
	      false,
	      'cooltable', '|'
	     );
}
main();
