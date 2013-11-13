
/**
 * Module dependencies.
 */

 var express = require('express');
 var http = require('http');
 var socketio = require('socket.io');

 var app = express();
 var dice = require('./dice');
 var User = require('./users');

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
		test()
        // io.sockets.emit('message', message);
    });
});

function process_new_bet(message){
	console.log("processing new bet");
	var pivot = dice.get_roll_pivot(message.chance,message.roll);
	console.log(pivot);
	console.log("Payout="+dice.calculate_payout(message.chance)+"X");
}

function process_randomize_seed(message){

}

server.listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});



function test()
{
	console.log("displaying");
	User.find(1,function(data){
		console.log(data);
	})
}

