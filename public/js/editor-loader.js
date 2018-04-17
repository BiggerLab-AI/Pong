(function() {
    /**
     * Initialize ACE Editor
     */
    const $editor = document.getElementById("editor");
    const $blockly = document.getElementById("blockly");

    /**
     * Save/Get Code Locally
     */
    window.saveCodeLocally = function(code) {
        localStorage.setItem("PingGameCode", code);
    }
    window.getCodeLocally  = function() {
        return localStorage.getItem("PingGameCode") || "";
    }

    /**
     * Initialize Submit Button
     */
    var workspace;

    window.submitCode = function (seed=5, callback=()=>{}) {
        if (!blocklyMode) {
            window.playerCode = editor.getValue();
        } else {
            window.playerCode = 'function (currentState, actionSpace) {' + Blockly.JavaScript.workspaceToCode(workspace) + '}';
        }
        window.saveCodeLocally(window.playerCode);

        try {
            eval("window.playerAI = " + window.playerCode);
        } catch (error) {
            alert("Your Code has Error! Please Check!");
        }
        
        window.restartGame(seed, callback);
    };

    var blocklyMode = true;
    const $switch = document.getElementById("switch");
    $switch.onclick = function (event) {
        if (!event) blocklyMode = false;
        else blocklyMode = !blocklyMode;
        if (blocklyMode) {
            $blockly.classList.add("show");
            $editor.classList.remove("show");
        } else {
            $blockly.classList.remove("show");
            $editor.classList.add("show");
        }
    }
    workspace = Blockly.inject('blockly',
        {
            media: './media/',
            toolbox: document.getElementById('toolbox')
        });
    window.workspace = workspace;
    Blockly.Xml.domToWorkspace(document.getElementById('demo'), workspace);

    let editor = ace.edit($editor, {
        mode: "ace/mode/javascript",
        selectionStyle: "text"
    });
    window.editor = editor;
    editor.setTheme("ace/theme/twilight");
    editor.setValue(window.getCodeLocally() || `
    /**
     * There are 5 objects in currentState
     * 
     * ball, enemy, player are lists with 2 elements:
     *  - currentState.ball[0] means the x axis of the ball
     *  - currentState.ball[1] means the y axis of the ball
     * board[0] indicates the length of player's board:
     *  - currentState.board[0]
     * board[1] indicates the length of enemy's board:
     *  - currentState.board[1]
     * speed indicates the velocity of the ball:
     *  - currentState[0] - vertical
     *  - currentState[1] - horizontal
     * 
     * There are 3 methods in actionSpace
     *  - actionSpace.moveLeft()
     *  - actionSpace.moveRight()
     *  - actionSpace.stop()
     * To Control the Board.
     */
    
    function (currentState, actionSpace) {
        if (currentState.ball[0] < currentState.player[0]) actionSpace.moveLeft();
        else if (currentState.ball[0] > currentState.player[0] + currentState.board[0]) actionSpace.moveRight();
        else actionSpace.stop();
    }
    `);
    editor.moveCursorTo(0, 0);

    // document.querySelector("rect.blocklyMainBackground").style = "";
    // document.querySelector("div.blocklyToolboxDiv").style.background="#222";
})();