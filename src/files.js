const fs = require('fs');
const readline = require('readline');
const stream = require('stream');

module.exports.fileExists = fileExists;
async function fileExists(path) {
    return await new Promise((resolve, reject) => {
	fs.stat(path, (err, stat) => {
	    if (err !== null && err.code === 'ENOENT') {
		resolve(false);
	    }
	    resolve(true);
	});
    });
}

module.exports.getHeadline = getHeadline;
async function getHeadline(path) {
    return new Promise( (resolve) => {
	let instream = fs.createReadStream(path);
	let outstream = new stream();
	let read = readline.createInterface(instream, outstream);

	let firstLine = true;

	read.on('line', function (line) {
	    read.close();
	    // TODO is the eventhandler always intelligent enough
	    // for this lock?
	    if (firstLine) {
		firstLine = false;
		resolve(line);
	    }
	});
    });
}

module.exports.getTaillines = getTaillines;
function getTaillines(path, cb, closeCB) {
    let instream = fs.createReadStream(path);
    let outstream = new stream();
    let read = readline.createInterface(instream, outstream);

    let firstLine = true;
    read.on('line', function (line) {
	if (firstLine) firstLine = false;
	else cb(line);
    });
    read.on('close', closeCB);
}

// module.exports.getLines = getLines;
function getLines(path, firstLineCB, cb, close) {
    let instream = fs.createReadStream(path);
    let outstream = new stream();
    let read = readline.createInterface(instream, outstream);

    // TODO refactor getHeadline / getTailline into this method
    // use backpressure to ensure first line gets processed
    // after other lines
    getHeadline(path, firstLineCB);
}
