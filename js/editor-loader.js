(function() {
    /**
     * Initialize ACE Editor
     */
    const $editor = document.getElementById("editor");
    const $blockly = document.getElementById("blockly");

    /**
     * Initialize Submit Button
     */
    var workspace;
    const $submit = document.getElementById("submit");
    $submit.onclick = function () {
        if (!blocklyMode) {
            eval("window.playerAI = " + editor.getValue());
        } else {
            let code = 'function (pack) {' + Blockly.JavaScript.workspaceToCode(workspace) + '}';
            eval("window.playerAI = " + code);
            // console.log(code);
        }
        window.restartGame();
    }

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

    var editor = ace.edit($editor, {
        mode: "ace/mode/javascript",
        selectionStyle: "text"
    });
    // window.editor = editor;
    editor.setTheme("ace/theme/twilight");
    editor.setValue(`
    /**
     * There are 5 objects in pack
     * 
     * ball, enemy, player are lists with 2 elements:
     *  - pack.ball[0] means the x axis of the ball
     *  - pack.ball[1] means the y axis of the ball
     * board indicates the length of player's board:
     *  - pack.board
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
        else if (pack.ball[0] > pack.player[0] + pack.board) return 1;
        else return 0;
    }
    `);
    editor.moveCursorTo(0, 0);
})();