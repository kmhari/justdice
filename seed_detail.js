var SeedDetail = exports = module.exports = {};
var db = require("./connect");
var Seed = require("./seed");

SeedDetail.create = function (user_id,callback){
	console.log("goging to create\n\n");
	db.query('INSERT INTO seed_details (user_id,server_seed,client_seed) VALUES (?,?,?);',
		[user_id,
		Seed.create_server_seed(),
		Seed.create_client_seed()],
	 function(err, rows, fields) {
		if (err) {
			console.log(err);
			throw err;
		}
		if(rows.length==0){
			console.log("No user by the id:"+id);
			throw {err:"user not found",id:id}
		}
		SeedDetail.find(rows.insertId,callback);
	})
};

SeedDetail.find = function (id,callback){
	db.query('SELECT * FROM seed_details where id = ?',id, function(err, rows, fields) {
		if (err) {
			console.log(err);
			throw err;
		}
		if(rows.length==0){
			console.log("No seed detail by the id:"+id);
			throw {err:"seed detail not found",id:id}
		}
		callback(rows[0]);
	}
	)
};

