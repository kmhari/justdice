var User = exports = module.exports = {};
var db = require("./connect");
	
User.find = function (id,callback){
	db.query('SELECT * FROM users where id = ?',id, function(err, rows, fields) {
		if (err) {
			console.log(err);
			throw err;
		}
		if(rows.length==0){
			console.log("No user by the id:"+id);
		}
		callback(rows[0]);
	}
	)
};

User.fing_by_gid = function(gid,callback){
	db.query('SELECT * FROM users where gid = ?',gid, function(err, rows, fields) {
		if (err) {
			console.log(err);
			throw err;
		}
		if(rows.length==0){
			console.log("No user by the gid:"+gid);
			callback(null,{err:"Gid Not Found",code:1})
		}else
		callback(rows[0],null);
	}
	)
};

User.set_new_seed = function(gid,seed_detail_id,callback){
	db.query('UPDATE users set seed_detail_id = ? where gid = ? ',[seed_detail_id,gid], function(err, rows, fields) {
		if (err) {
			console.log(err);
			throw err;
		}
		callback(rows);
	}
	)
};