(function() { 

    // Initialize Socket Communications
    var socket = io();

    /**
     * Available functions: (token required when login, binded with socketID)
     * 
     * -- Auth:
     * "login", token
     * 
     * -- Code:
     * "getPlayerList"
     * "getPlayerCode", name, playerID
     * "saveMyCode", codeFile { name, version, code }
     * 
     * -- Replay:
     * "getLatestLogs"
     * "getLogs", offset, limit
     */
    
    var logined = false;
    const $userName = document.getElementById("username");
    const $codeName = document.getElementById("codename");
    const $myList = document.getElementById("myList");
    const $playerList = document.getElementById("playerList");

    socket.on("updateLogin", userName => {

        if (!userName) {
            logined = false;
            window.playerName = "You";
        } else {
            logined = true;
            window.playerName = userName;
        }

        // Update View

    });

    socket.on("updatePlayerList", playerList => {

        window.playerList = playerList;

        // Update View

    });

    socket.on("updatePlayerCode", codeFile => {

        if (codeFile.playerName == window.playerName) { setupWorkSpace(codeFile); }
        else {
            window.enemyName = codeFile.playerName;
            window.enemyCode = codeFile.code;
            window.enemyAI = eval(codeFile.code);
            window.restartGame();
        }

        // Update View

    });

    socket.on("savedCode", version => {

        // Update View

    });

    socket.on("updateLatestLogs", logs => {

        // Update View

    });

    socket.on("updateLogs", logsBundle => {

        let offset = logsBundle.offset;
        let limit  = logsBundle.limit;

        for (let log in logsBundle.logs) {
            window.logList[log] = logsBundle.logs[log];
        }
        
        // Update View

    });

    /**
     * Initialize working space
     * @param {object} codeFile 
     */
    var setupWorkSpace = function (codeFile=null) {
        if (!codeFile) return;
        $codeName.innerHTML = `${codeFile.name} - ${codeFile.version}`;
        window.playerCode = codeFile.code;
        window.editor.setValue(codeFile.code);
    }

}());