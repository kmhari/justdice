var Seed = exports = module.exports = {};

var crypto = require('crypto');

function create_rand_string(length)
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789/.,<>?;:[]{}!@#$%^&*()_+-=";

    for( var i=0; i < length; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

Seed.create_server_seed = function(){
	return create_rand_string(64);
}

Seed.get_server_hash_by_seed = function(seed){
	return crypto.createHash('sha256').update(seed).digest("hex");
}