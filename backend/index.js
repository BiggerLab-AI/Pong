const koa    = require('koa'),
      app    = new koa(),
      server = require('http').Server(app.callback()),
      io     = require('socket.io')(server),
      path   = require('path');

// Get Server Port
const port = process.env.PONG_PORT;
const VERBOSE = true;
 
/**
 * PlayerList initialize
 */
var bots = {};
var logsOnUser = {};
var logs = [];

// Load Static File
app.use(require('koa-static')("../public"));

var getCredential = (socketID) => {
    return socketID.substr(0, 6);
}

// Socketio Functions
io.on('connection', socket => {

    if (VERBOSE) console.log("[System] " + socket.id + ": Login.");

    socket.on('login', () => {

        let user = getCredential(socket.id);
        if (!bots[user]) bots[user] = {};
        if (user) 
            socket.emit("updateLogin", user);
        else
            socket.emit("updateLogin", false);

    });
    
    socket.on("getPlayerList", () => {

        if (VERBOSE) console.log("[System] Get playerList for " + getCredential(socket.id) + `.`);
        if (getCredential(socket.id)) {
            socket.emit("updatePlayerList", bots);
        }

    });

    socket.on("getPlayerCode", codeInfo => {


        if (getCredential(socket.id)) {

            if (VERBOSE) console.log("[System] Get code for " + codeInfo.playerName + `:` + codeInfo.name + `.`);
            socket.emit("updatePlayerCode", {
                playerName: codeInfo.playerName,
                name: codeInfo.name || codeInfo.playerName,
                code: codeInfo.name ? 
                        bots[codeInfo.playerName][codeInfo.name] : 
                        bots[codeInfo.playerName][Object.keys(bots[codeInfo.playerName])[0]]
            });
        }

    });

    socket.on("saveMyCode", codeFile => {

        let user = getCredential(socket.id);
        if (user) {

            if (VERBOSE) console.log("[System] Saved code for " + getCredential(socket.id) + `:` + codeFile.name + `.`);
            if (!bots[user]) bots[user] = {};
            bots[user][codeFile.name] = codeFile.code;
            socket.emit("savedCode", true);

        }

    });

    socket.on("getLatestLogs", () => {

        let user = getCredential(socket.id);
        if (user) {

            if (VERBOSE) console.log("[System] Get Own Logs for " + user + `.`);
            socket.emit("updateLatestLogs", logsOnUser[user]);

        }

    });

    socket.on("getLogs", options => {
        
        if (getCredential(socket.id)) {
            if (VERBOSE) console.log("[System] Get Logs for " + getCredential(socket.id) + `.`);
            socket.emit("updateLogs", logs.slice(options.offset || 0, options.size || 10));
        }

    });

    socket.on('disconnect', () => {

        let user = getCredential(socket.id);
        if (!bots[user]) return;
        if (Object.keys(bots[user]).length == 0) delete bots[user];
        if (VERBOSE) console.log("[System] " + socket.id + `: Disconnect.`);

    });

});

// Listen on server port
let myPort = parseInt(port) ? parseInt(port) : 8080;
server.listen(myPort, "0.0.0.0", () => {
    console.log(`Server Starts At http://0.0.0.0:${myPort}`);
});