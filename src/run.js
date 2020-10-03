const main = require('./main');

async function run() {
    ['CSVPATH', 'SQLPATH', 'DELIM'].forEach(function(varname) {
	if (process.env[varname] == null || 
	    process.env[varname].length == 0) 
	    throw new Error('Please supply '+varname);
    });

    let csvPath = process.env['CSVPATH'];
    let sqlitePath = process.env['SQLPATH'];
    let delimiter = process.env['DELIM'];
    let tablename = process.env['TABLENAME'];

    await main(csvPath, sqlitePath, 
	      false,
	      tablename, delimiter
	     );
}
run();

