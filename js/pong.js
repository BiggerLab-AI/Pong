(function() {

    /**
     * Scaling of the game
     * for the game size is to be
     * (16 * SCALE) x (9 * SCALE)
     */
    var SCALE = 40;

    /**
     * Scaling for retina screen
     * Especially for chrome
     * default value is 2
     */
    var ISC = 2;

    /**
     * Whether or not to print debug message
     */
    var VERBOSE = false;

    /**
     * Phaser3 Default Configuration
     */
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
    };

    /**
     * Definitions of game instances
     */
    var game = new Phaser.Game(config);
    var that;

    /**
     * Definitions of ball velocity
     */
    var verticalVelocity = 350;
    var horizontalVelocity = 0;

    /**
     * Definitions of game objects
     */
    var cursors,
        player,
        enemy,
        ball,
        enemyDeadField,
        playerDeadField,
        gameText,
        hintText,
        stepper;

    /**
     * Definitions of game state machine
     * 
     * gameState:
     * 0: pausing
     * 1: playing
     * 2: I am winner
     * 3: I am loser
     * 
     */
    var gameState = 0;
    
    /**
     * Definitions of ai function
     */
    window.enemyAI  = null;
    window.playerAI = null;
    

    /**
     * Definitions of hint texts
     */
    const HINTTEXT = 'Esc to Pause, ` Key to resume the game\n          ← or → to Move.';


    /**
     * Load Assets
     */
    function preload () {
        this.load.image('starfield', 'assets/starfield.png');
        this.load.image('paddle'   , 'assets/paddle.png'   );
        this.load.image('ball'     , 'assets/ball.png'     );
        this.load.image('boundary' , 'assets/deadline.png' );
    }

    /**
     * Create Main Scene
     */
    function create () {

        // Load Background Image
        this.add.tileSprite(0, 0, 9 * SCALE * ISC, 16 * SCALE * ISC, 'starfield');

        // Saving Scene Object
        that   = this;
        
        // Load Upper and Downer Boundary
        enemyDeadField = this.physics.add.sprite(0, 0, 'boundary');
        playerDeadField = this.physics.add.sprite(0, 16 * SCALE, 'boundary');
        enemyDeadField.body.immovable = true;
        playerDeadField.body.immovable = true;

        // Load Player Boards
        player = this.physics.add.sprite(9 * SCALE / 2, 16 * SCALE - 20, 'paddle');
        enemy  = this.physics.add.sprite(9 * SCALE / 2, 20, 'paddle');
        player.setBounce(0);
        player.setCollideWorldBounds(true);
        player.body.immovable = true;
        enemy.setBounce(0);
        enemy.setCollideWorldBounds(true);
        enemy.body.immovable = true;

        // Load Middle Acceleration Boundary
        stepper = this.physics.add.sprite(0, 16 * SCALE / 2, 'boundary');

        // Binding Keyboard
        // cursors = {
        //     "left" : this.input.keyboard.addKey(37),
        //     "right": this.input.keyboard.addKey(39),
        //     "esc"  : this.input.keyboard.addKey(27),
        // }

        // Load Hint Texts
        gameText = this.add.text(9 * SCALE / 2 - 90, 16 * SCALE / 2 - 20, ' PAUSING  ', { fontSize: '32px', fill: '#FFF' });
        hintText = this.add.text(9 * SCALE / 2 - 110, 16 * SCALE / 2 + 30, HINTTEXT, { fontSize: '10px', fill: '#CCC' });

        // Register Ball
        registerBall();
    }

    /**
     * Init function of creating a ball
     * @param {none}
     */
    function registerBall() {
        ball = that.physics.add.sprite(9 * SCALE / 2, 16 * SCALE / 2, 'ball');
        ball.setBounce(1);
        ball.setCollideWorldBounds(true);
        ball.setVelocityY(verticalVelocity * -1);
        ball.setVelocityX(parseInt(150 - Math.random() * 300));
        that.physics.add.collider(ball, player, hitBall, null, that);
        that.physics.add.collider(ball, enemy , hitBall, null, that);
        that.physics.add.collider(ball, enemyDeadField, hitWall, null, that);
        that.physics.add.collider(ball, playerDeadField, hitWall, null, that);
        that.physics.add.overlap(ball, stepper, addSpeed, null, that);
    }

    /**
     * Gaming Loop
     */
    function update () {

        if (gameState != 1) {

            // game is paused or ended

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

            // game is on

            this.physics.resume();
            hintText.setText("");
            gameText.setText("");

        }

        // Calling AIs to make decisions
        if (window.enemyAI !== null) {
            callAI(enemy, window.enemyAI);
        }

        // Calling Players AI to make decisions
        if (window.playerAI !== null) {
            callAI(player, window.playerAI);
        }

    }

    /**
     * callAI - call AI to control one object
     * @param {object} Phaser Object
     * @param {function} AI Function
     */
    function callAI(boardObject, fn) {

        // Broadcasting informations to AI
        let aiPack = {
            "ball":   [ball.body.x, ball.body.y],
            "player": [player.body.x, player.body.y],
            "enemy":  [enemy.body.x, enemy.body.y],
            "board":  player.width,
            "speed":  [horizontalVelocity, verticalVelocity]
        }

        // Standardize the AI output
        let res = parseFloat(fn(aiPack));
        if (isNaN(res)) res = 0;
        if (Math.abs(res) > 1) res = parseInt(res / Math.abs(res));

        // Move according to instructions of AI
        boardObject.setVelocityX(res * 300);

    }

    /**
     * Default Built-in AI
     * @param {*} pack 
     */
    window.enemyAI = function (pack) {

        let xOfBall = pack.ball[0];
        let lOfBoard = pack.enemy[0];
        let rOfBoard = pack.enemy[0] + pack.board;
        let midOfBoard = (lOfBoard + rOfBoard) / 2;

        let distanceOfBall = Math.abs(pack.ball[1] - pack.enemy[1]);
        let velocityOfBall = pack.speed[1];
        let maximumMove = distanceOfBall / velocityOfBall * 300;
        let minimumMove = Math.abs(pack.ball[0] - pack.enemy[0]);
        
        if (maximumMove > minimumMove) {

            // Doing Aggressive Mode
            if (xOfBall < (lOfBoard + 5)) return -1;
            else if (xOfBall > (rOfBoard - 5)) return 1;
            else if (xOfBall < midOfBoard) return 0.8;
            else return -0.8;

        } else {

            // Doing Conservative Mode
            if (xOfBall < midOfBoard) return -1;
            else return 1;

        } 

    }

    /**
     * Actions when hitting upper or downer boundary
     * @param {object} ball
     * @param {object} wall
     */
    function hitWall (ball, wall) {
        
        // if ball hitting player's boundary, player lose
        if (wall == playerDeadField) gameState = 3;

        // if ball hitting enemy's boundary, enemy lose
        else if (wall == enemyDeadField) gameState = 2;

    }

    /**
     * Actions when ball passes acceleration boundary
     * @param {object} ball
     * @param {object} wall
     */
    function addSpeed(ball, wall) {

        verticalVelocity += 20;

        // Calculating the direction (-1 / 0 / 1) of ball
        let unit = 1;
        if (ball.body.velocity.y != 0) unit = parseInt(ball.body.velocity.y / Math.abs(ball.body.velocity.y));

        // Updating Vertical Speed
        ball.setVelocityY(verticalVelocity * unit);

        // Print debugging message
        if (VERBOSE) console.log("Current Speed: " + (verticalVelocity * unit));

    }

    /**
     * Actions when ball hits board
     * @param {object} ball
     * @param {object} board
     */
    function hitBall (ball, board) {

        if (ball.body.x < board.body.x + 20) 
            ball.setVelocityX(horizontalVelocity = (ball.body.x - board.body.x - 20) / 20 * verticalVelocity);
        else if (ball.body.x > board.body.x + board.width - 20) 
            ball.setVelocityX(horizontalVelocity = (ball.body.x - board.body.x - board.width + 20) / 20 * verticalVelocity);
        
        horizontalVelocity = Math.abs(horizontalVelocity);

        // Print debugging message
        if (VERBOSE) console.log("Hit");

    }

    /**
     * Restart game
     */
    window.restartGame = function () {
        ball.destroy();
        registerBall();
        horizontalVelocity = 350;
        horizontalVelocity = 0;
        gameState = 1;
    }

})();