/*  
 *  For this to run, just exec npm install
 */

// Get dependencies
var irc = require('irc');
var xdcc = require('./lib/xdcc');

// Set IRC configuration
var config = {
    server: 'irc.rizon.net',
    nick: 'xdcc-er',
    options: {
        channels: ['#Chan'],
        userName: 'xdcc-er',
        realName: 'xdcc-er',
        debug: true
    }
};

// Connect to the server
var client = new irc.Client(config.server, config.nick, config.options);
console.log("-- CONNECTING TO " + config.server + " AS " + config.nick);


// Request pack #1337 from ``XDCC-Bot''
// Store the file in ``/path/to/Downloads''
// And notify ``owner'' about the progress

client.on('join', function (channel, nick, message) {
    if (nick == config.nick && channel == config.options.channels[0]) {
        console.log('-- Joined ' + channel);
        xdcc.request(client, {
            pack: '#1337',
            nick: 'XDCC-Bot',
            path: '/path/to/Downloads',
            notify: 'owner'
        });
    }
});

client.on('registered', function () {
    console.log('-- REGISTERED');
});

// XDCC handlers
client.on("xdcc-connect", function (pack) {
    client.say(pack.notify, "Beginning download of " + pack.filename);
    console.log("-- BEGINING XDCC OF " + pack.filename);
});

client.on("xdcc-data", function (pack, recieved) {
    var progress = Math.floor(recieved / pack.filesize * 100);
    process.stdout.write("-- " + progress + "% DONE " + pack.filename);
    process.stdout.cursorTo(0);
});

client.on("xdcc-complete", function (pack) {
    client.say(pack.notify, "Completed download of " + pack.filename);
    console.log("-- COMPLETED XDCC OF " + pack.filename);
});

client.on("xdcc-error", function (pack, error) {
    client.say(pack.notify, "Error with " + pack.filename + " from " + pack.nick);
    console.log("-- XDCC ERROR WITH " + pack.filename + ": " + JSON.stringify(error));
    client.emit("xdcc-cancel", pack.nick);
});

client.on("error", function (message) {
    console.log("-- IRC ERROR: " + JSON.stringify(message));
});
