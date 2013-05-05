// See READM.md for Usage

// Get depenencies
var net = require("net");
var fs  = require("fs");

exports.request = function(client, args) {
    // Set finished state to false
    var finished = false;
    
    // Function to parse pack information the bot sends
    function parse_pack_info(string) {
        // Function to convert Integer to IP address
        function int_to_IP(n) {
            var octets = [];
            
            octets.unshift(n & 255);
            octets.unshift((n >> 8) & 255);
            octets.unshift((n >> 16) & 255);
            octets.unshift((n >> 24) & 255);
            
            return octets.join(".");
        }
        
        // Split the string into an array
        var params = string.split(" ");
        
        return {
            notify   :                    args.notify,
            nick     :                    args.nick,
            filename :                    params[2],
            ip       : int_to_IP(parseInt(params[3], 10)),
            port     :           parseInt(params[4], 10),
            filesize :           parseInt(params[5], 10)
        };
    }
    
    // Function for checking if the data is part of an XDCC transfer
    function is_data(message) { return (message.substr(0, 9) == "DCC SEND "); }
    
    // Request the pack
    client.say(args.nick, "XDCC SEND "+args.pack);
    
    // Add handler for cancel event
    client.on("xdcc-cancel", function(nick) {
        if (finished) { return; }
        
        // Cancel the pack
        // TODO restart other packs from the same bot
        if (nick == args.nick) {
            client.say(nick, "XDCC CANCEL");
            
            finished = true;
        }
    });
    
    // Listen for data from the XDCC bot
    client.on("ctcp-privmsg", function(sender, target, message) {
        if (finished) { return; }
        
        if (sender == args.nick && target == client.nick && is_data(message)) {
            // Parse the bot message and get the pack information
            var pack = parse_pack_info(message);
            
            // Get the download location
            var location = args.path+(args.path.substr(-1, 1) == "/" ? "" : "/")
                           +pack.filename;
            
            // Create write stream to the file
            var stream = fs.createWriteStream(location);
            
            stream.on("open", function() {
                var send_buffer = new Buffer(4);
                var received = 0;
                
                // Open connection to the bot
                var conn = net.connect(pack.port, pack.ip, function() {
                    client.emit("xdcc-connect", pack);
                });
                
                // Callback for data
                conn.on("data", function(data) {
                    stream.write(data);
                    
                    received += data.length;
                    
                    send_buffer.writeUInt32BE(received, 0);
                    conn.write(send_buffer);
                    
                    client.emit("xdcc-data", pack, received);
                });
                
                // Callback for completion
                conn.on("end", function() {
                    // End the transfer
                    finished = true;
                    
                    stream.end();
                    conn.destroy();
                    
                    client.emit("xdcc-complete", pack);
                });
                
                // Add error handler
                conn.on("error", function(error) {
                    // Send error message and cancel pack
                    client.emit("xdcc-error", pack, error);
                    client.emit("xdcc-cancel", pack);
                });
            });
            
            // Add error handler
            stream.on("error", function(error) {
                // Send error message and cancel pack
                client.emit("xdcc-error", pack, error);
                client.emit("xdcc-cancel", pack);
            });
        }
    });
};