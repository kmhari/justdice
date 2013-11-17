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


io.sockets.on('connection', function (socket) {
    socket.on('message', function (message) {
//		console.log('received message:', message);
        switch (message.action) {
            case "new-bet":
                process_new_bet(message, socket);
                break;
            case "randomize-seed":
                process_randomize_seed(message);
                break;
            case "username":
                process_username(socket,message);
                break;
        }
        // io.sockets.emit('message', message);
    });

    socket.on('justnow', function (message) {
//        Cache.find_user(message.gid,function(err,reply){
//            console.log(reply);
//        })
        User.fing_by_gid(message.gid, function (data, err) {
            if (err) {
                socket.emit("error", handle_error(err.code));
            } else {
                if (data.seed_detail_id == 0) {
                    SeedDetail.create(data.id, data.gid, function (seed_data) {
                        User.set_new_seed(data.gid, seed_data.id, function (user_update) {
                            if (user_update.changedRows == 1) {
                                message = {
                                    "action": "seed_data",
                                    "ssh": Seed.get_server_hash_by_seed(seed_data.server_seed),
                                    "cs": seed_data.client_seed,
                                    "nonce": 1,
                                    "balance": data.points,
                                    "name": data.username
                                };
                                socket.emit("message", message);
                            } else {

                            }
                        });
                    })
                } else {
                    SeedDetail.find(data.seed_detail_id, function (seed_data) {
                        message = {
                            "action": "seed_data",
                            "ssh": Seed.get_server_hash_by_seed(seed_data.server_seed),
                            "cs": seed_data.client_seed,
                            "nonce": 1,
                            "balance": data.points,
                            "name": data.username
                        };
                        socket.emit("message", message);
                    })
                }
            }
        })

    });
});

function handle_error(err) {
    return err_code[err];
}

function process_new_bet(message, socket) {
    User.bet(message, function (bet_results,err) {
        if(err){
            socket.emit("error",err);
        }else
        Bet.find(bet_results["bet_result_data"], function (bet_data) {
            bet_data["action"] = "new_bet";
            io.sockets.emit("message", bet_data);
            bet_data["action"] = "my_bet";
            socket.emit("message", bet_data);
            socket.emit("balance", bet_results["user_balance"]);
            // console.log(bet_data);
        });

    });
}

function process_username(socket, message) {
    User.is_present_by_name(message.name, function (err, result) {
        if (err) {

        } else {
            if (result) {
                socket.emit("error", handle_error(3));
            } else {
                User.set_name_by_gid(message.gid, message.name, function (err, result) {
                    socket.emit("message", {action: 'new_name', name: message.name});
                });
            }
        }
    });
}

function process_randomize_seed(message) {

}

server.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});


function test() {
    console.log("displaying");

}

