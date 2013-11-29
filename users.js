var User = exports = module.exports = {};
var db = require("./connect");
var Bet = require('./bet');
var Dice = require('./dice');
var SeedDetail = require('./seed_detail');
var Seed = require('./seed');
var crypto = require('crypto');

User.initialize = function (socket) {
    socket.on("setup", function (message) {
        console.log((message));
        User.is_present_by_name(message.username, function (err, result, user) {
            if (err) {

            }
            else if ((!result) || (result && user.gid == message.gid)) {
                User.setup_user_by(message, function (err, response) {
                    if (err) {
                        console.log("on setup:", err);
                        socket.emit("setup-response", {success: false})
                    } else {
                        socket.emit("setup-response", {success: true})
                    }
                });
            } else {
                socket.emit("setup-response", {success: false, message: "Name Already Taken"})
            }
        })
    });
}

User.login_by_gid = function (gid, callback) {
    User.find_by_gid(gid, function (err, rows) {
        if (!err && rows.length == 1)
            callback(true);
        else {
            console.log(err, rows);
            callback(false);
        }

    });
};

User.find = function (id, callback) {
    db.query('SELECT * FROM users where id = ?', id, function (err, rows, fields) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else if (rows.length == 0) {
                console.log("No user by the id:" + id);
            } else
                callback(err, rows[0]);
        }
    )
};

User.find_by_gid = function (gid, callback) {
    db.query('SELECT * FROM users where gid = ?', gid, function (err, rows, fields) {
            if (err) {
                console.log(err);
                throw err;
            }
            if (rows.length == 0) {
                console.log("No user by the gid:" + gid);
                callback({err: "Gid Not Found", code: 1}, null);
            } else
                callback(null, rows[0]);
        }
    )
};

User.set_new_seed = function (gid, seed_detail_id, callback) {
    db.query('UPDATE users set seed_detail_id = ? where gid = ? ', [seed_detail_id, gid], function (err, rows, fields) {
            if (err) {
                console.log(err);
                throw err;
            } else
                callback(rows);
        }
    )
};

User.bet = function (message, callback) {
    User.find_by_gid(message.gid, function (err, data) {
        if (parseFloat(data.points) < message.bet) {
            callback(null, {err: 2, message: "Insufficient Balance in:User.bet"})
        } else
            Bet.get_next_nonce([data.seed_detail_id, data.id], function (nonce_data) {
                nonce_data++;
                SeedDetail.find(data.seed_detail_id, function (err, seed_data) {
                    var roll = (message.roll == "rhigh") ? "high" : "low";
                    var target = Dice.get_target(message.chance, message.roll);
                    console.log("target:",target,"\n\n\n\n\n\n");
                    var ssh = Seed.get_server_hash_by_seed(seed_data.server_seed);
                    var ss = seed_data.server_seed;
                    var cs = seed_data.client_seed;
                    var payout = Dice.calculate_payout(message.chance);
                    var sn = 1;
                    var nb = nonce_data;
                    var result = Seed.get_result(ssh, ss, cs, sn, nb);
                    if (roll == "high")
                        won = result > target;
                    else
                        won = result < target;
                    var profit = (won) ? Dice.calculate_profit(message.chance, message.bet) : parseFloat(-1 * message.bet).toFixed(7);
                    var bet_details = [data.id, data.seed_detail_id, roll, won, message.bet, payout, profit, message.chance, target, result, nonce_data];

                    Bet.create(bet_details, function (bet_result_data) {
                        console.log("Created Bet");
                        var ret = [];
                        ret["bet_result_data"] = bet_result_data;
                        ret["user_balance"] = data.points+ profit;
                        callback(ret);
                    })
                })

            })
    });
}

User.user_point_add = function (id, amount, callback) {
    db.query('UPDATE users SET points = points + ? where id = ? ', [parseFloat(amount), id], function (err, rows, fields) {
        if (err) {
            callback(err, null);
        } else
            callback(null, rows);
    });
}

User.transfer = function (from, to, amount, callback) {
    User.find(from, function (err, data) {
        if (err) {
            console.log(err);
            callback({err: "Unknown User", code: 1}, null);
        } else if (amount <= data.points) {
            User.user_point_add(from, -amount, function (err, from_data) {
                if (err) {
                    callback({err: err, code: -1}, null);
                } else {
                    User.user_point_add(to, amount, function (err, to_data) {
                        if (err) {
                            callback({err: err, code: -1}, null);
                        } else {
                            callback(null, {from: from_data, to: to_data, info: data});
                        }


                    });
                }
            });
        } else {
            callback({err: "Insufficient Balance in:User:transfer", code: 2}, null);
        }
    });
}

User.banker_point_add = function (amount, callback) {
    User.user_point_add(1, amount, callback);
};

User.find_by_name = function (name, callback) {
    db.query('SELECT * FROM users WHERE username = ? ', name, function (err, rows, fields) {
        if (err) {
            callback(err, null);
        } else if (rows.length == 0) {
            callback(null, null);
        } else
            callback(null, rows[0]);
    });
}

User.is_present_by_name = function (name, callback) {
    User.find_by_name(name, function (err, result) {
        if (err) callback(err, null)
        else if (err == null && result == null) callback(null, false, null);
        else callback(null, true, result);
    });
};


User.set_name_by_gid = function (gid, name, callback) {
    db.query('UPDATE users SET username = ? WHERE gid = ?', [name, gid], function (err, rows, fields) {
        console.log(err, rows);
        if (err) {
            console.log(err);
            callback(err, null);
        } else {
            callback(null, rows);
        }
    });
}

User.login = function (name, password, callback) {
    db.query("SELECT * FROM users WHERE username = ?", name, function (err, rows) {
        if (err) {
            console.log(err);
            callback(0);
        } else {
            var pass = crypto.createHash('md5').update(rows[0].gid + password).digest('hex');
            (pass == rows[0].password) ? callback(1) : callback(0);
        }
    });
}

User.setup_user_by = function (data, callback) {
    var pass = crypto.createHash('md5').update(data.gid + data.password).digest('hex');
    db.query('UPDATE users SET username = ? , password = ? WHERE gid = ?', [data.username, pass, data.gid], function (err, rows, fields) {
        if (err) {
            console.log(err);
            callback(err, null);
        } else {
            callback(null, rows);
        }
    });
}

User.create = function (gid, callback) {
    db.query('INSERT INTO users (points,gid) VALUES (100,?);',
        gid,
        function (err, rows, fields) {
            callback(err, rows);
        })
};

User.get_balance = function (id, callback) {
    db.query("SELECT points FROM users WHERE id= ?;", id, function (err, rows) {
        if (err) {
            callback(err, null);
        } else {
            callback(err, rows[0].points);
        }
    });
}

User.page = function (pgno,callback) {
    db.query("SELECT * FROM users ;", function (err, rows) {
       callback(rows);
    });
}