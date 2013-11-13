var mysql      = require('mysql');

var db = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '',
	database : 'gambit_development' 
});

module.exports = db;