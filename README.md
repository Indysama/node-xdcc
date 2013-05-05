#Node.js XDCC library
requires Node.js IRC library. (`npm install irc`)

IRC library for downloading files from XDCC bots.

##Usage

```xdcc.request(client, args);```

####Requests an XDCC from `{client}` based on `{args}`

`{client}` IRC client (from IRC library)
`{args}` Information about the XDCC pack
    
    args = {
        "pack"      : < XDCC Pack ID >,
        "nick"      : < XDCC Bot Nick >,
        "path"      : < Path to download to >,
        "notify"    : <*Channel/nick to notify about progress >,
        "overwrite" : <*Boolean, overwrite instead of resume >
    }
``` {*}  indicates optional argument```

##Callbacks

```client.on('xdcc-connect', pack);```

####Emitted when an XDCC transfer starts
`{pack}`      is the XDCC pack information, see `Pack format` below
 
```client.on('xdcc-data', pack, recieved);```
####Emitted when an XDCC transfer receives data
`{pack}`      is the XDCC pack information, see `Pack format` below
`{recieved}`  is the amount of data received
 
```client.on('xdcc-complete', pack);```
####Emitted when an XDCC transfer is complete
`{pack}`      is the XDCC pack information, see `Pack format` below
 
```client.on('xdcc-error', pack, error);```
####Emitted when an XDCC transfer encounters an error
`{pack}`      is the XDCC pack information, see `Pack format` below
`{error}`     is the error data
 
##Listeners
```client.emit('xdcc-cancel', nick);```
####When emitted, all XDCC transfers to `{nick}` are cancelled.
`{nick}`      nick to cancel XDCC transfers from
 
##Pack format
    pack = {
        "filename"  : <Name of file being transferred>
        "filesize"  : <Size of file being transferred>
        "nick"      : <Nick of file sender>
        "ip"        : <IP of file sender>
        "port"      : <Port of file sender>
        "notify"    : <Channel/nick to notify about progress>
    }
