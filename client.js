var Pool = exports = module.exports = {};
var User = require('./users');

var client_sockets = {}
var client_sockets_name = {}

Pool.add_client = function (socket, name, gid) {
    client_sockets[gid] = socket;
    client_sockets_name[name] = gid;
};

Pool.del_client = function (gid) {
    delete client_sockets.gid;
    User.find_by_gid(gid,function(err, data){
        delete client_sockets_name.username;
    })
};

Pool.get_client = function (gid) {
    return client_sockets.gid;
};

Pool.get_client_by_name = function (name) {
    return client_sockets[client_sockets_name[name]];
};