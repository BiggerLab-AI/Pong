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
    const $logList = document.getElementById("logList");

    const $submit_stupid = document.getElementById("submit_stupid"); 
    const $submit_simple = document.getElementById("submit_simple");    
    const $submit_jerry = document.getElementById("submit_jerry");

    function submitCode(points, winner, seed) {
        console.log(`Update my score to: ${points[0]}`);
        socket.emit("updateScore", points[0]);
        socket.emit("updateHistory", {
            enemy: window.enemyName,
            winner: winner,
            seed: seed
        });
    }

    $submit_stupid.onclick = function () {
        window.enemyName = "Computer";
        window.enemyAI = window._aiStupid;
        window.submitCode(Math.round(window.Math._oldRandom() * 10), submitCode);
    };

    $submit_simple.onclick = function () {
        window.enemyName = "Computer";
        window.enemyAI = window._aiSimple;
        window.submitCode(Math.round(window.Math._oldRandom() * 10), submitCode);
    };

    $submit_jerry.onclick = function () {
        window.enemyName = "Computer";
        window.enemyAI = window._aiJerry;
        window.submitCode(Math.round(window.Math._oldRandom() * 10), submitCode);
    };

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
            socket.emit("getHistory");
        }

    });

    // socket.emit("updateScore", n);

    function pad(i) { return `${i}`.padStart(2, "0"); };

    socket.on("updateHistory", history => {
        let html = "";
        for (let i = 0; i < history.length; i++) {
            let t = new Date(history[i].time);
            html += `<span>${pad(t.getMonth())}/${pad(t.getDate())} ${pad(t.getHours())}:${pad(t.getMinutes())}:${pad(t.getSeconds())}</span>`;
            html += `<button id="replay-${history[i].enemy}-${history[i].time}" class="submit">${history[i].enemy}</button>`;
        }
        $logList.innerHTML = html;
        for (let i = 0; i < history.length; i++) {
            let his = history[i];
            document.getElementById(`replay-${his.enemy}-${his.time}`).onclick = function() {
                window._snap_count = 0;
                socket.emit("getPlayerCodeSnap", {
                    playerName: his.user,
                    name: his.user,
                    snap: his.snap1,
                    seed: his.seed
                });
                socket.emit("getPlayerCodeSnap", {
                    playerName: his.with,
                    name: his.with,
                    snap: his.snap2,
                    seed: his.seed
                });
            };
        }
    });

    socket.on("updatePlayerList", playerList => {

        window.playerList = playerList;
        buildList("myList", playerList[window.playerName] || {});
        buildList("playerList", playerList);

    });

    socket.on("updatePlayerCode", codeFile => {

        if (codeFile.playerName == window.playerName) { 
            setupWorkSpace(codeFile);
            if (document.getElementById("switch").onclick) {
                document.getElementById("switch").onclick(0);
            }
        } else {
            let seed = parseInt(codeFile.seed) || 5;
            window.enemyName = codeFile.playerName;
            window.enemyCode = codeFile.code;
            eval(`window.enemyAI = ${codeFile.code}`);
            window.submitCode(seed, submitCode);
        }

        // Update View

    });

    socket.on("updatePlayerCodeSnap", codeFile => {

        let seed = parseInt(codeFile.seed);
        if (codeFile.playerName == window.playerName) { 
            setupWorkSpace(codeFile);
            if (document.getElementById("switch").onclick) {
                document.getElementById("switch").onclick(0);
            }
            window._snap_count += 1;
        } else {
            window.enemyName = codeFile.playerName;
            window.enemyCode = codeFile.code;
            eval(`window.enemyAI = ${codeFile.code}`);
            window._snap_count += 1;
        }

        if (window._snap_count >= 2) {
            window.submitCode(seed, () => {});
            window._snap_count = 0;
        }

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
        socket.emit("getScores");
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
        try {
            eval("_temp_ai_code = " + editor.getValue());
            socket.emit("saveMyCode", {
                name: $codeName.value,
                code: editor.getValue(),
            });
        } catch (error) {
            alert("Please Check your Code for Syntax Error!");
        }
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