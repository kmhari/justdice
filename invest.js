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
    User.find(1, function (data) {
        db.query('INSERT INTO investments (user_id,invest,bank_balance) VALUES (?,?,?);', user, amount, data.points,
            function (err, rows, fields) {
                if (err)
                    callback(null, err);
                else
                    callback(data, null);
            })
    });

}

Invest.calculate_profit = function(id){


}


