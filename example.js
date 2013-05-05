/*  
 *  For this to run, example.js must be placed one directory higher
 *  and the library ``irc'' must be installed. (`npm install irc`)
 *  
 */

// Get dependencies
var irc  = require("irc");
var xdcc = require("xdcc");

// Set IRC configuration
var config = {
    server : "irc.rizon.net",
    nick   : "xdcc-er",
    options : {
        channels : ["#NEWS"],
        userName : "xdcc-er",
        realName : "xdcc-er"
    }
};

// Connect to the server
var client = new irc.client(config.server, config.nick, config.options);
console.log("-- CONNECTING TO "+config.server+" AS "+config.nick);

// Request pack #2463 from ``XDCC-Bot''
// Store the file in ``/path/to/Downloads''
// And notify ``owner'' about the progress
xdcc.request(client, {
    pack : "#2463",
    nick : "XDCC-Bot",
    path : "/path/to/Downloads",
    notify : "owner"
});

// XDCC handlers
client.on("xdcc-connect", function(pack) {
    client.say(pack.notify, "Beginning download of "+pack.filename);
    console.log("-- BEGGINING XDCC OF "+pack.filename);
});

client.on("xdcc-data", function(pack, recieved) {
    var progress = Math.floor(recieved / pack.size);
    console.log("-- "+progress+"% DONE "+pack.filename);
});

client.on("xdcc-complete", function(pack) {
    client.say(pack.notify, "Completed download of "+pack.filename);
    console.log("-- COMPLETED XDCC OF "+pack.filename);
});

client.on("xdcc-error", function(pack, error) {
    client.say(pack.notify, "Error with "+pack.filename+" from "+pack.nick);
    console.log("-- XDCC ERROR WITH "+pack.filename+": "+JSON.stringify(error));
});