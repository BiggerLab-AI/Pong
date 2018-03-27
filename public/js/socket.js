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
    const $loginname = document.getElementById("loginname");
    const $loginpass = document.getElementById("loginpass");
    const $loginsubmit = document.getElementById("loginsubmit");
    const $userpanel = document.getElementById("userpanel");
    const $myScore = document.getElementById("myScore");
    const $leaderBoard = document.getElementById("leaderBoard");

    socket.on("updateLogin", userInfo => {

        if (!userInfo) {
            logined = false;
            $loginsubmit.disabled = false;
            $loginsubmit.innerHTML = "Login";
            window.playerName = "You";
        } else {
            logined = true;
            window.playerName = userInfo.name;
            window.currentUser = userInfo;

            $userpanel.innerHTML = `<p>Welcome: ${window.playerName}</p>`;

            socket.emit("getPlayerList");
            socket.emit("getScore");
        }

    });

    // socket.emit("updateScore", n);

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

        socket.emit("getPlayerList");

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

    socket.on("updateScore", score => {
        $myScore.innerHTML = score;
    });

    socket.on("updateScores", scoreList => {
        let html = "";
        for (let i = 0; i < scoreList.length; i++) {
            html += `<p>${i+1}. ${scoreList[i].user}: ${scoreList[i].score}</p>`
        }
        $leaderBoard.innerHTML = html;
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

    $loginsubmit.onclick = function() {
        $loginsubmit.disabled = true;
        $loginsubmit.innerHTML = "LoginING";
        socket.emit("login", {
            user: $loginname.value,
            passwd: $loginpass.value
        });
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

    socket.emit("getScores");

}());