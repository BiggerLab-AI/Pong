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
    return "Dev User";
}

// Socketio Functions
io.on('connection', socket => {

    if (VERBOSE) console.log("[System] " + socket.id + ": Login.");

    socket.on('login', token => {

        let user = getCredential(socket.id);
        if (user) 
            socket.emit("updateLogin", user);
        else
            socket.emit("updateLogin", false);

    });
    
    socket.on("getPlayerList", () => {

        if (getCredential(socket.id)) {
            socket.emit("updatePlayerList", Object.keys(bots));
        }

    });

    socket.on("getPlayerCode", codeInfo => {


        if (getCredential(socket.id)) {
            socket.emit("updatePlayerCode", {
                playerName: codeInfo.playerID,
                name: codeInfo.name,
                code: bots[codeInfo.playerID][codeInfo.name]
            });
        }

    });

    socket.on("saveMyCode", codeFile => {

        let user = getCredential(socket.id);
        if (user) {

            bots[user][codeInfo.name] = codeInfo.code;
            socket.emit("savedCode", true);

        }

    });

    socket.on("getLatestLogs", () => {

        let user = getCredential(socket.id);
        if (user) {

            socket.emit("updateLatestLogs", logsOnUser[user]);

        }

    });

    socket.on("getLogs", options => {
        
        if (getCredential(socket.id)) {
            socket.emit("updateLogs", logs.slice(options.offset || 0, options.size || 10));
        }

    });

    socket.on('disconnect', () => {

        if (VERBOSE) console.log("[System] " + socket.id + `: Disconnect.`);

    });

});

// Listen on server port
let myPort = parseInt(port) ? parseInt(port) : 8080;
server.listen(myPort, "0.0.0.0", () => {
    console.log(`Server Starts At http://0.0.0.0:${myPort}`);
});