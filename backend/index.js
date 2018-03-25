const koa    = require('koa'),
      app    = new koa(),
      server = require('http').Server(app.callback()),
      io     = require('socket.io')(server),
      path   = require('path'),
      db     = require('./db.js'),
      fs     = require('fs');

if (!fs.existsSync("./code")) fs.mkdirSync("./code");

// Get Server Port
const port = process.argv[2] || process.env.PONG_PORT;
const VERBOSE = true;

/**
 * PlayerList initialize
 */
var userList = {};
var logsOnUser = {};
var logs = [];

var getAllBots = function(user=null, callback) {
    callback(db.listCode(user));
}

var saveUserCode = function(user, name, code) {
    db.saveCode(user, name, code);
}

// Load Static File
app.use(require('koa-static')("../public"));

var getCredential = (socketID) => {
    return userList[socketID] ?
               userList[socketID].name :
               null;
}

var loginUser = (user, passwd, callback) => {
    db.checkUser(user, passwd, info => {
        callback(info);
    });
}

// Socketio Functions
io.on('connection', socket => {

    if (VERBOSE) console.log("[System] " + socket.id + ": Login.");
    userList[socket.id] = null;

    socket.on('login', cred => {

        cred.user = cred.user || "";
        cred.passwd = cred.passwd || "";

        loginUser(cred.user, cred.passwd, info => {
            if (info.error) {
                // Login Incorrect
                socket.emit("updateLogin", false);
            } else {
                // Login Success
                userList[socket.id] = info;
                socket.emit("updateLogin", info);
            }
        });

    });
    
    socket.on("getPlayerList", () => {

        if (VERBOSE) console.log("[System] Get playerList for " + getCredential(socket.id) + `.`);
        
        let user = getCredential(socket.id);
        if (user) {
            getAllBots(null, (allBots) => {
                getAllBots(user, (myBots) => {
                    botList = allBots;
                    botList[user] = myBots;
                    socket.emit("updatePlayerList", botList);
                });
            });
        }

    });

    socket.on("getPlayerCode", codeInfo => {


        if (getCredential(socket.id)) {

            if (VERBOSE) console.log("[System] Get code for " + codeInfo.playerName + `:` + codeInfo.name + `.`);
            
            socket.emit("updatePlayerCode", {
                playerName: codeInfo.playerName,
                name: codeInfo.name || codeInfo.playerName,
                code: codeInfo.name ? 
                        db.readCode(codeInfo.playerName, codeInfo.name):
                        db.readCode(codeInfo.playerName, codeInfo.playerName)
            });
        }

    });

    socket.on("saveMyCode", codeFile => {

        let user = getCredential(socket.id);
        if (user) {

            if (VERBOSE) console.log("[System] Saved code for " + getCredential(socket.id) + `:` + codeFile.name + `.`);
            
            saveUserCode(user, codeFile.name, codeFile.code);
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

        if (userList[socket.id]) delete userList[socket.id];
        if (VERBOSE) console.log("[System] " + socket.id + `: Disconnect.`);

    });

});

// Listen on server port
let myPort = parseInt(port) ? parseInt(port) : 8080;
server.listen(myPort, "0.0.0.0", () => {
    console.log(`Server Starts At http://0.0.0.0:${myPort}`);
});