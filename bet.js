var Bet = exports = module.exports = {};
var db = require("./connect");
var SeedDetail = require("./seed_detail");

Bet.create = function (options,callback){
	db.query('INSERT INTO bets (user_id,seed_detail_id,roll,won,bet,payout,profit,chance,target,lucky,nonce) '+
		'VALUES (?,?,?,?,?,?,?,?,?,?,?);',options,
	 function(err, rows, fields) {
		if (err) {
			console.log(err);
			throw err;
		}else
		if(rows.length==0){
			console.log("No user by the id:"+id);
			throw {err:"user not found",id:id}
		}else{
		callback(rows[0]);
		}
	})
};

Bet.get_next_nonce = function (options,callback){
	db.query('SELECT count(id) FROM bets WHERE seed_detail_id = ? AND user_id = ?',options,
		function(err, rows, fields){
            callback(rows[0]["count(id)"]);
		});
};


