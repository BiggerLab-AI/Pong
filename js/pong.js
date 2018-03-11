(function() {
    var SCALE = 40; // Scaling of the game, default is 40
    var ISC   = 2;  // Pixel scaling, default 2 for chrome
    var VERBOSE = false; // Whether to print out debug information in console
    var config = {
        type: Phaser.AUTO,
        width: 9 * SCALE,
        height: 16 * SCALE,
        parent: "viewer",
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 },
                debug: false
            }
        },
        scene: {
            preload: preload,
            create: create,
            update: update
        }
    }; // config file for Phaser

    var game = new Phaser.Game(config);
    var that;
    var vol = 250;

    var cursors,
        player,
        enemy,
        ball,
        enemyDeadField,
        playerDeadField,
        gameText,
        hintText,
        stepper,
        gameState = 0;
    
    window.aifunc = null;
    // definition of some global variables
    /**
     * gameState:
     * 0: pausing
     * 1: playing
     * 2: I am winner
     * 3: I am loser
     */

    const HINTTEXT = 'Esc to Pause, ` Key to resume the game\n          ← or → to Move.';
    // Hint text

    function preload () {
        this.load.image('starfield', 'assets/starfield.png');
        this.load.image('paddle', 'assets/paddle.png');
        this.load.image('ball', 'assets/ball.png');
        this.load.image('boundary', 'assets/deadline.png');
    }

    function create () {
        this.add.tileSprite(0, 0, 9 * SCALE * ISC, 16 * SCALE * ISC, 'starfield');
        // Background

        that   = this;
        // Saving scene object
        
        enemyDeadField = this.physics.add.sprite(0, 0, 'boundary');
        playerDeadField = this.physics.add.sprite(0, 16 * SCALE, 'boundary');
        enemyDeadField.body.immovable = true;
        playerDeadField.body.immovable = true;
        // Adding Upper and Downer Boundary

        player = this.physics.add.sprite(9 * SCALE / 2, 16 * SCALE - 20, 'paddle');
        player.setBounce(0);
        player.setCollideWorldBounds(true);
        player.body.immovable = true;
        // Player Board

        enemy  = this.physics.add.sprite(9 * SCALE / 2, 20, 'paddle');
        enemy.setBounce(0);
        enemy.setCollideWorldBounds(true);
        enemy.body.immovable = true;
        // Enemy Board

        stepper = this.physics.add.sprite(0, 16 * SCALE / 2, 'boundary');
        // Acceleration Boundary

        cursors = {
            "left": this.input.keyboard.addKey(37),
            "right": this.input.keyboard.addKey(39),
            "esc": this.input.keyboard.addKey(27),
            // "res": this.input.keyboard.addKey(96),
        }
        // Registration of Keyboard

        gameText = this.add.text(9 * SCALE / 2 - 90, 16 * SCALE / 2 - 20, ' PAUSING  ', { fontSize: '32px', fill: '#FFF' });
        hintText = this.add.text(9 * SCALE / 2 - 110, 16 * SCALE / 2 + 30, HINTTEXT, { fontSize: '10px', fill: '#CCC' });
        // Two Hint Texts

        registerBall();
    }

    /**
     * Used for registering new ball
     * @param {none}
     */
    function registerBall() {
        ball = that.physics.add.sprite(9 * SCALE / 2, 16 * SCALE / 2, 'ball');
        ball.setBounce(1);
        ball.setCollideWorldBounds(true);
        ball.setVelocityY(vol * -1);
        ball.setVelocityX(parseInt(150 - Math.random() * 300));
        that.physics.add.collider(ball, player, hitBall, null, that);
        that.physics.add.collider(ball, enemy , hitBall, null, that);
        that.physics.add.collider(ball, enemyDeadField, hitWall, null, that);
        that.physics.add.collider(ball, playerDeadField, hitWall, null, that);
        that.physics.add.overlap(ball, stepper, addSpeed, null, that);
    }

    function update () {

        let prev = true;
        // if (cursors.res.isDown && gameState == 0) { gameState = 1; prev = false; }
        if (gameState != 1) {
            this.physics.pause();
            switch (gameState) {
                case 0:
                    gameText.setText(" PAUSING  ");
                    hintText.setText(HINTTEXT);
                    break;
                case 2:
                    gameText.setText("YOU WIN!!!");
                    break;
                case 3:
                    gameText.setText("YOU LOSE!!");
                    break;
            }
            return;
        } else {
            this.physics.resume();
            hintText.setText("");
            gameText.setText("");
        }
        // Judging from state to decide the game thread

        if (cursors.esc.isDown && prev) {
            gameState = 0;
            return;
        }
        // Decide whether to pause the game

        callAI(enemy, sampleAI);
        // Caller of default ai

        if (window.aifunc !== null) {
            callAI(player, window.aifunc);
            return;
        }
        // Decide whether to start user ai

        if (cursors.left.isDown) {
            player.setVelocityX(-150);
        } else if (cursors.right.isDown) {
            player.setVelocityX(150);
        } else {
            player.setVelocityX(0);
        }
        // Input from user keyboard

    }

    /**
     * callAI - call AI to control one object
     * @param {object} Phaser Object
     * @param {function} AI Function
     */
    function callAI(ob, fn) {
        let aiPack = {
            "ball":   [ball.body.x, ball.body.y],
            "player": [player.body.x, player.body.y],
            "enemy":  [enemy.body.x, enemy.body.y],
            "board":  player.width,
            "vol":    vol
        }
        let res = parseFloat(fn(aiPack));
        if (isNaN(res)) res = 0;
        if (Math.abs(res) > 1) res = 0;
        ob.setVelocityX(res * 300);
    }

    /**
     * Default Built-in AI
     * @param {*} pack 
     */
    function sampleAI(pack) {
        if (pack.ball[0] < pack.enemy[0]) return -1;
        else if (pack.ball[0] > pack.enemy[0] + pack.board) return 1;
        else return 0;
    }

    /**
     * Actions when hitting upper or downer boundary
     * @param {object} ball
     * @param {object} wall
     */
    function hitWall (b, w) {
        if (w == playerDeadField) gameState = 3;
        else if (w == enemyDeadField) gameState = 2;
    }

    /**
     * Actions when ball passes acceleration boundary
     * @param {object} ball
     * @param {object} wall
     */
    function addSpeed(b, s) {
        vol += 5;
        let unit = 1;
        if (ball.body.velocity.y != 0) unit = parseInt(ball.body.velocity.y / Math.abs(ball.body.velocity.y));
        ball.setVelocityY(vol * unit);
        if (VERBOSE) console.log("Current Speed: " + (vol * unit));
    }

    /**
     * Actions when ball hits board
     * @param {object} ball
     * @param {object} wall
     */
    function hitBall (b, p) {
        if (b.body.x < p.body.x + 20) ball.setVelocityX((b.body.x - p.body.x - 20) * 8);
        else if (b.body.x > p.body.x + p.width - 20) ball.setVelocityX((b.body.x - p.body.x - p.width + 20) * 8);
        if (VERBOSE) console.log("Hit");
    }


    /**
     * Initialize ACE Editor
     */
    const $editor = document.getElementById("editor");
    const $blockly = document.getElementById("blockly");

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
     * vol indicates the vertical velocity of the ball:
     *  - pack.vol
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

    /**
     * Initialize Submit Button
     */
    var workspace;
    const $submit = document.getElementById("submit");
    $submit.onclick = function () {
        if (!blocklyMode) {
            eval("window.aifunc = " + editor.getValue());
        } else {
            let code = 'function (pack) {' + Blockly.JavaScript.workspaceToCode(workspace) + '}';
            eval("window.aifunc = " + code);
            console.log(code);
        }
        ball.destroy();
        registerBall();
        gameState = 1;
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
            media: 'https://blockly-demo.appspot.com/static/media/',
            toolbox: document.getElementById('toolbox')
        });
    window.workspace = workspace;
    Blockly.Xml.domToWorkspace(document.getElementById('demo'), workspace);
})();