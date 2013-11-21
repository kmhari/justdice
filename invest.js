/**
 * Created with JetBrains WebStorm.
 * User: hariharasudhan
 * Date: 16/11/13
 * Time: 12:57 PM
 * To change this template use File | Settings | File Templates.
 */
var Invest = exports = module.exports = {};
var User = require("./users");

Invest.create = function (user, amount, callback) {
    db.query("START TRANSACTION");
    User.find(1, function (err, result) {
        User.transfer(user, 1, amount, function (err, result) {
            if (err) {
                db.query("ROLLBACK");
                callback(err, null);
            } else {
                db.query("INSERT INTO investments (user_id,invest,bank_balance) VALUES (?,?,?)", [from, amount, user.points],
                    function (err, rows, fields) {
                       if(err){
                           callback({err: err, code: -1},null);
                       }else{
                           callback(null,rows);
                       }
                    });
            }
        });
    });


}

Invest.calculate_profit = function (id) {


}


