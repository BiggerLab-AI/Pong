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
var playerList = {};

// Load Static File
app.use(require('koa-static')("../public"));

var getCredential = (token) => {
    return token;
}

// Socketio Functions
io.on('connection', socket => {

    if (VERBOSE) console.log("[System] " + socket.id + ": Login.");
    playerList[socket.id] = "";

    socket.on('login', token => {

        playerList[socket.id] = getCredential(token);
        socket.emit("updateLogin", playerList[socket.id]);

    });
    
    socket.on("getPlayerList", () => {

    });

    socket.on("getPlayerCode", codeInfo => {
        // codeInfo.name
        // codeInfo.playerID
    });

    socket.on("saveMyCode", codeFile => {
        // codeFile.name
        // codeFile.code
    });

    socket.on("getLatestLogs", () => {

    });

    socket.on("getLogs", options => {
        // options.offset
        // options.limit
    })

    socket.on('disconnect', () => {

        if (VERBOSE) console.log("[System] " + socket.id + `: Disconnect.`);
        delete playerList[socket.id];

    });

});

// Listen on server port
let myPort = parseInt(port) ? parseInt(port) : 8080;
server.listen(myPort, "0.0.0.0", () => {
    console.log(`Server Starts At http://0.0.0.0:${myPort}`);
});