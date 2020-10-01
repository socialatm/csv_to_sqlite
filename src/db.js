/** create table
    returns a promise as the table needs to be created
    before it can be inserted upon
*/
module.exports.create = create;
function create(db, tablename, fields) {
    return new Promise((resolve) => {
	let text = 'CREATE TABLE '+tablename+' (';
	let firstField = true;

	fields = fields.map(function(field) {
	    return field.replace(/[^\w]/g,"");
	});

	fields.forEach(function(field) {
	    if (!firstField) text += ',';
	    text += field+ ' text';
	    if (firstField) firstField = false;
	});
	text += ')';

	//console.log('CREATE:', text);
	db.run(text, function() {
	    resolve(fields);
	});
    });
}


module.exports.createInsertStmt = createInsertStmt;
function createInsertStmt(db, tablename, fields) {
    let text = 'INSERT INTO '+tablename+' (';
 
    let firstField = true;
    fields.forEach(function(field) {
	if (!firstField) text += ',';
	text += field;
	if (firstField) firstField = false;
    });

    text += ') VALUES (';
    firstField = true;
    fields.forEach(function(field) {
	if (!firstField) text += ',';
	text += '?';
	if (firstField) firstField = false;
    });
    text += ')';
    return db.prepare(text);
}


/** create inserts for given table
    is supposed to be used in parallel context
*/
function insert(db, tablename, fields) {
    let text = 'INSERT INTO '+tablename+' VALUES (';
    let firstField = true;

    fields.map(function(field) {
	return field.replace(/"/g, '');
    }).forEach(function(field) {
	if (!firstField) text += ',';
	text += '"'+field+'"';
	if (firstField) firstField = false;
    });
    text += ')';

    //console.log(text);
    db.run(text);
}
