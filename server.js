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
var Chat = require("./chat");
var Pool = require("./client");
var path = require("path");

var ipaddr  = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
var port    = process.env.OPENSHIFT_NODEJS_PORT || 8080;

// all environments
app.set('port', process.env.PORT || 8000);
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.cookieParser());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

var server = http.createServer(app);
var io = socketio.listen(server);

app.get("/", function(req, res) {
    console.log("\n\n\n\n\nCookies");
    console.log(req.cookies);
    if(!(req.cookies.gambit_guid)){
        var gid = Seed.create_client_seed();
        res.cookie('gambit_guid', gid);
        User.create(gid,function(err,success){
            res.redirect("/index2.html");
        });
    }else
    res.redirect("/index2.html");
});

Chat.initialize(io);

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
                process_username(socket, message);
                break;
        }
        // io.sockets.emit('message', message);
    });

    socket.on('chat', function (message) {
        User.find_by_gid(message.gid, function (data, err) {
            console.log(data);
            if (message.message.substring(0, 3) == "/pm") {

                var pm = message.message.split(" ");
                var to = pm[1];
                if(!pm[1]) socket.emit("error",handle_error(5));
                if(!pm[2]) socket.emit("error",handle_error(6));
                pm.splice(0,2);
                var text = pm.join(' ');
                User.is_present_by_name(to, function (err,result) {
                    if(result)
                    Chat.addMessage(data.username, to, text);
                    else
                    socket.emit("error",handle_error(4));
                });

            } else
                Chat.addMessage(data.username, null, message.message);
        });
    });

    socket.on('justnow', function (message) {
//        Cache.find_user(message.gid,function(err,reply){
//            console.log(reply);
//        })
        console.log(message);
        if(!message.gid){
            socket.emit("error", handle_error(1));
        }else
        User.find_by_gid(message.gid, function (data, err) {
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
                                if (data.username)
                                    Pool.add_client(socket, message.name, data.gid);
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
                        if (data.username)
                            Pool.add_client(socket, message.name, data.gid);
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
    User.bet(message, function (bet_results, err) {
        if (err) {
            socket.emit("error", err);
        } else
            Bet.find(bet_results["bet_result_data"], function (bet_data) {
                bet_data["action"] = "new_bet";
                io.sockets.emit("message", bet_data);
                bet_data["action"] = "my_bet";
                socket.emit("message", bet_data);
                socket.emit("balance", bet_results["user_balance"]);
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
                    Pool.add_client(socket, message.name, message.gid);
                    socket.emit("message", {action: 'new_name', name: message.name});
                });
            }
        }
    });
}

function process_randomize_seed(message) {

}

server.listen(ipaddr,port);


function test() {
    console.log("displaying");

}

