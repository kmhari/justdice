var Cache = exports = module.exports = {};
var client = require("./redis");
var User = require("./users");

Cache.find_user_by_gid = function (id, callback) {
    client.get(id, function (err, reply) {
        // reply is null when the key is missing
        if (reply == null) {

        }
        console.log(reply);
        callback(err, reply);
    });
}