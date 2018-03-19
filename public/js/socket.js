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
    const $save = document.getElementById("save");

    socket.on("updateLogin", userName => {

        if (!userName) {
            logined = false;
            window.playerName = "You";
        } else {
            logined = true;
            window.playerName = userName;
            socket.emit("getPlayerList");
        }

        // Update View

    });

    socket.on("updatePlayerList", playerList => {

        window.playerList = playerList;
        buildList("myList", playerList[window.playerName] || {});
        buildList("playerList", playerList);

    });

    socket.on("updatePlayerCode", codeFile => {

        if (codeFile.playerName == window.playerName) { setupWorkSpace(codeFile); }
        else {
            window.enemyName = codeFile.playerName;
            window.enemyCode = codeFile.code;
            eval(`window.enemyAI = ${codeFile.code}`);
            window.submitCode();
            window.restartGame();
        }

        // Update View

    });

    socket.on("savedCode", version => {

        if (version) alert("Saved!");
        else alert("Failed!");

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

    $save.onclick = function() {
        socket.emit("saveMyCode", {
            name: $codeName.value,
            code: editor.getValue(),
        });
    }

    window.onload = function() {
        socket.emit("login");
    }

    function buildList (id, list) {
        $e = document.getElementById(id);
        $e.innerHTML = "";

        let aim = "get";
        if (window.playerName in list) { aim = "compete"; }
        list = Object.keys(list);

        let html = "";
        for (let i = 0; i < list.length; i++) {
            if (aim == "compete" && list[i] == window.playerName) continue;
            html += `<button id="${aim}-${list[i]}" class="submit">${list[i]}</button>`;
        }

        $e.innerHTML = html;

        for (let i = 0; i < list.length; i++) {
            if (aim == "compete" && list[i] == window.playerName) continue;
            document.getElementById(`${aim}-${list[i]}`).onclick = function () {
                socket.emit("getPlayerCode", {
                    playerName: (aim == "get") ? window.playerName : list[i],
                    name: (aim == "get") ? list[i]: ""
                });
            }
        }
    }

}());