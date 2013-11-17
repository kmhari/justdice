var redis_server = require("redis");
var client = redis_server.createClient();


client.on("error", function (err) {
    console.log("Error " + err);
});

module.exports = client;