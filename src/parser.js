const fs = require('fs');
const csvParse = require('csv-parse');
const { Transform } = require('stream');

module.exports = parser;
function parser(path, delim, getNextLine) {
    const readstream = fs.createReadStream(path);
    const parser = csvParse({delimiter: delim});

    const transformer = new Transformer({
	objectMode: true, highWaterMark: 5
    }, getNextLine);        

    return readstream.pipe(parser).pipe(transformer);
}


class Transformer extends Transform {
    constructor(options, getNextLine) {
	super(options);
	this.header = true;
    }
    _transform(chunk, enc, finished) {
	if (this.header) {
	    this.header = false;
	    let columns = chunk.map(function(column) {
		return column.replace(/[^\w]/g, "");
	    });
	    finished(null, columns);
	}
	else {
	    finished(null, chunk);
	}
    }
}




