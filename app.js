
/**
 * Module dependencies.
 */

 var express = require('express');
 var http = require('http');
 var socketio = require('socket.io');
 var Seed = require('./seed');
 var Bet = require('./bet');
 var app = express();
 var dice = require('./dice');
 var User = require('./users');
 var SeedDetail = require('./seed_detail');
 var err_code = require("./error_code");

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
//		console.log('received message:', message);
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
		User.fing_by_gid(message.gid,function(data,err){
			if(err){
				console.log(err);
				console.log(handle_error(err,"justnow"));
				socket.emit("error",handle_error(err,"justnow"));
			}else{
				if(data.seed_detail_id==0){
					SeedDetail.create(data.id,data.gid,function(seed_data){
						User.set_new_seed(data.gid,seed_data.id,function(user_update){
							if(user_update.changedRows==1){
								message = {
									"action" : "seed_data",
									"ssh" : Seed.get_server_hash_by_seed(seed_data.server_seed),
									"cs" : seed_data.client_seed,
									"nonce" : 1
								};
								socket.emit("message",message);
							}else{

							}
						});	
					})
				}else{
					SeedDetail.find(data.seed_detail_id,function(seed_data){
						message = {
							"action" : "seed_data",
							"ssh" : Seed.get_server_hash_by_seed(seed_data.server_seed),
							"cs" : seed_data.client_seed,
							"nonce" : 1
						};
						socket.emit("message",message);
					})
				}
			}
		})

});
});

function handle_error(err,action){
	switch(action){
		case "justnow":
		return handle_just_now(err);
		break;
	}
}

function handle_just_now(err){
	return {err:1,message:"Kindly Delete the Cookies and try again"};
}

function process_new_bet(message){
	User.bet(message,function(bet_results){
        
    })

// 	User.find_by_gid(message.gid,function(data,err){
// 		user_data = data;

// 		console.log("processing new bet");
// 		SeedDetail.create(1,function(reseult){
// 			console.log(result);
// 		});
// 	// var pivot = dice.get_roll_pivot(message.chance,message.roll);
// 	// console.log(pivot);
// 	// console.log("Payout="+dice.calculate_payout(message.chance)+"X");
// 	// var ss = Seed.create_server_seed();
// 	// var cs = Seed.create_client_seed();
// 	// var ssh = Seed.get_server_hash_by_seed(ss);
// 	// console.log("seed:"+ss);
// 	// console.log("client:"+cs);
// 	// console.log("server-Hash:"+ssh);
// 	// console.log("\n\n\n\n");
// 	// Seed.roll(ssh,ss,cs,1,3);
// });
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

