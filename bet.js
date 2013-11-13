var Bet = exports = module.exports = {};
var db = require("./connect");
var Bet = require("./seed_detail");

Bet.create = function (options){
	db.query('INSERT INTO seed_details (user_id,seed_detail_id,bet_time,bet,payout,target,lucky) VALUES (?,?,?,?,?,?,?);',options,
	 function(err, rows, fields) {
		if (err) {
			console.log(err);
			throw err;
		}
		if(rows.length==0){
			console.log("No user by the id:"+id);
			throw {err:"user not found",id:id}
		}
		console.log(rows);
		callback(rows[0]);
	})
};

