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

Seed.create_client_seed = function(){
	return create_rand_string(24);
}

Seed.get_server_hash_by_seed = function(seed){

	return crypto.createHash('sha256').update(seed).digest("hex");
}

Seed.check = function(ssh,ss,cs) {
			    var randomize = 0;
			    var sn = "1"
			    sn = parseInt(sn);
			    var nb = "11"
			    nb = parseInt(nb);

			    for (j = sn + nb - 1; j >= sn; j--) {
			    	var gen = ""
					var ss2;
			        gen = j + ':' + cs + ':' + j;
			    	ss2 = j + ':' + ss + ':' + j;
			        hash =crypto.createHmac('sha512', ss2).update(gen).digest('hex');
			        i = 0;
			        roll = -1;
			        while (roll == -1) { // Non-reference implementation derived from the 'Fair?' description.
			            if (i == 25) {
			                l3 = hash.substring(125, 128);
			                l3p = l3.parseInt(l3, 16);
			                roll = l3p / 10000;
			            } else {
			                f5 = hash.substring(5 * i, 5 + 5 * i);
			                f5p = parseInt(f5, 16);
			                
			                if (f5p < 1000000) {
			                    roll = f5p / 10000;
			                }
			                i++;
			            }
			        }
			        console.log(j + ': ' + roll);
			    }
			    
			}
