var Chat = exports = module.exports = {};
var Pool = require("./client");

var index = 0;
var lastAccessed = 0;

var char_history = {};
var io;

Chat.addMessage = function (from, to, message) {
    if (to == null) {
        io.sockets.emit("chat", {from: from, message: message, private: false});
    } else {
        Pool.get_client_by_name(to).emit("chat", {from: from, message: message, private: true})
        Pool.get_client_by_name(from).emit("chat", {from: from, message: message, private: true})
    }
}

Chat.initialize = function (server) {
    io = server;
}