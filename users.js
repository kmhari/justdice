var User = exports = module.exports = {};
var db = require("./connect");
var Bet = require('./bet');
var Dice = require('./dice');
var SeedDetail = require('./seed_detail');
var Seed = require('./seed');

User.find = function (id, callback) {
    db.query('SELECT * FROM users where id = ?', id, function (err, rows, fields) {
            if (err) {
                console.log(err);
                throw err;
            } else if (rows.length == 0) {
                console.log("No user by the id:" + id);
            } else
                callback(rows[0]);
        }
    )
};

User.fing_by_gid = function (gid, callback) {
    db.query('SELECT * FROM users where gid = ?', gid, function (err, rows, fields) {
            if (err) {
                console.log(err);
                throw err;
            }
            if (rows.length == 0) {
                console.log("No user by the gid:" + gid);
                callback(null, {err: "Gid Not Found", code: 1})
            } else
                callback(rows[0], null);
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
    User.fing_by_gid(message.gid, function (data, err) {
        if(parseFloat(data.points)<message.bet){
             callback(null,{err:2,message:"Insufficient Balance"})
        }else
        Bet.get_next_nonce([data.seed_detail_id, data.id], function (nonce_data) {
            nonce_data++;
            SeedDetail.find(data.seed_detail_id, function (seed_data) {
                var roll = (message.roll == "rhigh") ? "high" : "low";
                var target = Dice.get_target(message.chance, message.roll);
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
                var profit = (won) ? Dice.calculate_profit(message.chance, message.bet) : parseFloat(-1 * message.bet);
                var bet_details = [data.id, data.seed_detail_id, roll, won, message.bet, payout, profit, message.chance, target, result, nonce_data];

                Bet.create(bet_details, function (bet_result_data) {
                    console.log("Created Bet");
                    var ret = [];
                    ret["bet_result_data"] = bet_result_data;
                    ret["user_balance"] = data.points + profit;
                    callback(ret);
                })
            })

        })
    });
}

User.user_point_add = function (id, amount, callback) {
    db.query('UPDATE users SET points = points + ? where id = ? ', [parseFloat(amount), id], function (err, rows, fields) {
        if (err) {
            callback(err,null);
        } else
            callback(null,rows);
    });
}

User.banker_point_add = function (amount, callback) {
    User.user_point_add(1, amount, callback);
};

User.find_by_name = function(name,callback){
    db.query('SELECT * FROM users WHERE username = ? ', name, function (err, rows, fields) {
        if (err) {
            callback(err,null);
        } else if(rows.length == 0){
            callback(null,null);
        }   else
            callback(null,rows[0]);
    });
}

User.is_present_by_name = function (name, callback) {
    User.find_by_name(name, function (err, result) {
        if (err == null && result == null) callback(err, false);
        else callback(null, true);
    });
};


User.set_name_by_gid = function (gid, name, callback) {
    db.query('UPDATE users SET username = ? WHERE gid = ?', [name, gid], function (err, rows, fields) {
        console.log(err,rows);
        if (err) {
            callback(err, null);
        } else{
            console.log(rows);
            callback(null, rows);
        }
    });
}