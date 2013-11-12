
/**
 * Module dependencies.
 */

 var express = require('express');
 var http = require('http');
 var socketio = require('socket.io');
 var mysql      = require('mysql');
 var app = express();

// all environments
app.set('port', process.env.PORT || 8000);
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
// app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '',
});

// connection.connect();

var server = http.createServer(app);
var io = socketio.listen(server);


io.sockets.on('connection', function(socket){
	socket.on('message', function(message){
		console.log('received message:', message);
		switch(message.action){
			case "new-bet":
			process_new_bet(message);
			break;
			case "randomize-seed":
			process_randomize_seed(message);
			break;
		}
        // io.sockets.emit('message', message);
    });
});

function process_new_bet(message){
	console.log("processing new bet");
}

function process_randomize_seed(message){

}

server.listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});



function test()
{connection.query('SELECT 1 + 1 AS solution', function(err, rows, fields) {
	if (err) throw err;

	console.log('The solution is: ', rows[0].solution);
});
}
connection.end();
