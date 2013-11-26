/**
 * Created with JetBrains WebStorm.
 * User: hariharasudhan
 * Date: 16/11/13
 * Time: 12:57 PM
 * To change this template use File | Settings | File Templates.
 */
var Invest = exports = module.exports = {};
var User = require("./users");
var db = require("./connect");
var err_code = require("./error_code");

Invest.initialize = function (socket) {
    socket.on("invest-all", function (message) {
        User.find_by_gid(message.gid, function (err, user_data) {
            if (user_data.points > 0) {
                Invest.create(user_data.id, user_data.points, function (err, data) {
                    if (err) {
                        console.log("Invest.initialize", err);
                    } else {
                        Invest.get_total_investments(user_data.id, function (err, total) {
                            socket.emit("update", {balance: data.info.points - user_data.points, investment: total})
                        })
                    }
                });
            }
        });
    });


    socket.on("invest", function (message) {
        var amount = parseFloat(message.amount);
        if ((!isNaN(amount)) && amount > 0) {
            User.find_by_gid(message.gid, function (err, user_data) {
                if (err) {
                    callback(err, null);
                } else {
                    if (amount <= user_data.points) {
                        Invest.create(user_data.id, message.amount, function (err, data) {
                            if (err) {
                                console.log("Invest.initialize", err);
                            } else {
                                Invest.get_total_investments(user_data.id, function (err, total) {
                                    socket.emit("update", {balance: data.info.points - amount, investment: total})
                                })
                            }
                        });
                    } else {
                        socket.emit("error", err_code[7]);
                    }
                }
            });
        }
    });
}

Invest.emit_investment = function (id, socket) {
    Invest.calculate_profit(id, function (err, profit, total, balance) {
        if (!err) socket.emit("update", {investment: total, bankroll: (((profit / balance) * 100).toFixed(7))});

    });
}
Invest.create = function (user, amount, callback) {
    db.query("START TRANSACTION");
    User.find(1, function (err, banker) {
        User.transfer(user, 1, amount, function (err, result) {
            if (err) {
                db.query("ROLLBACK");
                callback(err, null);
            } else {
                db.query("INSERT INTO investments (user_id,invest,bank_balance) VALUES (?,?,?)", [user, amount, banker.points + amount],
                    function (err, rows, fields) {
                        if (err) {
                            db.query("ROLLBACK");
                            callback({err: err, code: -1}, null);
                        } else {
                            db.query("COMMIT");
                            callback(null, result);
                        }
                    });
            }
        });
    });
}

Invest.create_by_gid = function (user, amount, callback) {
    User.find_by_gid(user, function (err, user_data) {
        if (err) {
            callback(err, null);
        } else {
            Invest.create(user_data.id, amount, callback);
        }
    });
}

Invest.calculate_profit = function (id, callback) {
    Invest.get_all_investments(id, function (err, rows) {
        if (err) {
            callback(err, null);
        } else {
            User.get_balance(1, function (err, current_balance) {
                var profit = 0;
                var total = 0;
                for (var i = 0; i < rows.length; i++) {
                    total += rows[i].invest
                    profit += parseFloat(current_balance / rows[i].bank_balance) * rows[i].invest
                }
                callback(null, profit, total, current_balance);
            })
        }
    })
}


Invest.get_all_investments = function (id, callback) {
    db.query("SELECT * FROM investments WHERE user_id = ? ;", id, callback);
}

Invest.get_total_investments = function (id, callback) {
    Invest.get_all_investments(id, function (err, data) {
        var total = 0;
        for (i = 0; i < data.length; i++)
            total += parseFloat(data[i].invest);
        callback(err, total);
    });
}