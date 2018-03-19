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
    const $submit_stupid = document.getElementById("submit_stupid"); 
    const $submit_simple = document.getElementById("submit_simple");    
    const $submit_jerry = document.getElementById("submit_jerry");

    $submit_stupid.onclick = function () {
        window.enemyAI = window._aiStupid;
        window.submitCode();
    };

    $submit_simple.onclick = function () {
        window.enemyAI = window._aiSimple;
        window.submitCode();
    };

    $submit_jerry.onclick = function () {
        window.enemyAI = window._aiJerry;
        window.submitCode();
    };

    window.submitCode = function () {
        if (!blocklyMode) {
            window.playerCode = editor.getValue();
        } else {
            window.playerCode = 'function (pack) {' + Blockly.JavaScript.workspaceToCode(workspace) + '}';
        }
        window.saveCodeLocally(window.playerCode);
        eval("window.playerAI = " + window.playerCode);
        window.restartGame();
    };

    var blocklyMode = true;
    const $switch = document.getElementById("switch");
    $switch.onclick = function () {
        blocklyMode = !blocklyMode;
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
     * There are 5 objects in pack
     * 
     * ball, enemy, player are lists with 2 elements:
     *  - pack.ball[0] means the x axis of the ball
     *  - pack.ball[1] means the y axis of the ball
     * board[0] indicates the length of player's board:
     *  - pack.board[0]
     * board[1] indicates the length of enemy's board:
     *  - pack.board[1]
     * speed indicates the velocity of the ball:
     *  - pack[0] - vertical
     *  - pack[1] - horizontal
     * 
     * The return value should between -1 and 1, deciding the horizontal velocity of player's board:
     *  - return -1    means to scroll left with full spead
     *  - return 0     means to stop
     *  - return 0.5   means to scroll right with half spead
     */
    
    function (pack) {
        if (pack.ball[0] < pack.player[0]) return -1;
        else if (pack.ball[0] > pack.player[0] + pack.board[0]) return 1;
        else return 0;
    }
    `);
    editor.moveCursorTo(0, 0);
})();