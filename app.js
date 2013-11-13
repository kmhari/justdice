
/**
 * Module dependencies.
 */

 var express = require('express');
 var http = require('http');
 var socketio = require('socket.io');
 var Seed = require('./seed');
 var app = express();
 var dice = require('./dice');
 var User = require('./users');
 var SeedDetail = require('./seed_detail');

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
        // io.sockets.emit('message', message);
    });
    
    socket.on('justnow',function(message){
    	console.log(message);
    	User.fing_by_gid(message.gid,function(data){
    		console.log(data);
    	});
    });
});

function process_new_bet(message){
	User.find(1,function(data){
	user_data = data;
	
	console.log("processing new bet");
	SeedDetail.create(1,function(result){
		console.log(result);
	});
	// var pivot = dice.get_roll_pivot(message.chance,message.roll);
	// console.log(pivot);
	// console.log("Payout="+dice.calculate_payout(message.chance)+"X");
	// var ss = Seed.create_server_seed();
	// var cs = Seed.create_client_seed();
	// var ssh = Seed.get_server_hash_by_seed(ss);
	// console.log("seed:"+ss);
	// console.log("client:"+cs);
	// console.log("server-Hash:"+ssh);
	// console.log("\n\n\n\n");
	// Seed.roll(ssh,ss,cs,1,3);


})
}

function process_randomize_seed(message){

}

server.listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});



function test()
{
	console.log("displaying");
	
}

