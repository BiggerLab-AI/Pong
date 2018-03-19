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

    // Using Keyboard
    var botMade = true;

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
    window.enemyCode = "";
    window.playerCode = "";

    window.enemyName = "Computer";
    window.playerName = "You";

    window.playerList = {};
    window.logList = {};

    window.Math._oldRandom = window.Math.random;

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
        this.load.image('paddle-2' , 'assets/paddle-2.png' );
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
        if (botMade) {
            player = this.physics.add.sprite(9 * SCALE / 2, 16 * SCALE - 20, 'paddle');
        } else {
            player = this.physics.add.sprite(9 * SCALE / 2, 16 * SCALE - 20, 'paddle-2');
        }
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
        if (botMade) {
            cursors = {
                "left" : this.input.keyboard.addKey(37),
                "right": this.input.keyboard.addKey(39),
                "esc"  : this.input.keyboard.addKey(27),
            }
        }

        // Load Hint Texts
        gameText = this.add.text(9 * SCALE / 2 - 90, 16 * SCALE / 2 - 20, ' PAUSING  ', { fontSize: '32px', fill: '#FFF' });
        hintText = this.add.text(9 * SCALE / 2 - 110, 16 * SCALE / 2 + 30, HINTTEXT, { fontSize: '10px', fill: '#CCC' });

        // Register Ball
        registerBall();
        resetRandomSeed(seed=5);
    }

    /**
     * Init function of creating a ball
     * @param {none}
     */
    function registerBall(isNagative=0) {
        // Initialize Ball Graphic
        ball = that.physics.add.sprite(9 * SCALE / 2, 16 * SCALE / 2, 'ball');
        ball.setBounce(1);
        ball.setCollideWorldBounds(true);
        ball.body.stopVelocityOnCollide = false;

        // Initialize Velocity
        if (isNagative) ball.setVelocityY(-350);
        else ball.setVelocityY(350);
        ball.setVelocityX(parseInt(150 - Math.random() * 300));

        // Initialize Boundary Hit
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

        if (botMade) {
            // Calling Players AI to make decisions
            if (window.playerAI !== null) {
                callAI(player, window.playerAI);
            }
        } else {
            if (cursors.left.isDown) {
                player.setVelocityX(-400);
            } else if (cursors.right.isDown) {
                player.setVelocityX(400);
            } else {
                player.setVelocityX(0);
            }
        }

    }

    /**
     * callAI - call AI to control one object
     * @param {object} Phaser Object
     * @param {function} AI Function
     */
    function callAI(boardObject, fn) {

        // Broadcasting informations to AI
        let player1 = null,
            player2 = null;
        if (boardObject == player) { player1 = player; player2 = enemy; }
        else { player2 = player; player1 = enemy; }

        let aiPack = {
            "ball":   [ball.body.x   , ball.body.y   ],
            "player": [player1.body.x, player1.body.y],
            "enemy":  [player2.body.x, player2.body.y],
            "board":  [player1.width , player2.width ],
            "speed":  [ball.body.velocity.x, ball.body.velocity.y]
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
    window.enemyAI = window._aiSimple = function (pack) {

        if (pack.ball[0] < pack.player[0]) return -1;
        else if (pack.ball[0] > pack.player[0] + pack.board[0]) return 1;
        else return 0;

    }

    window._aiStupid = function(pack) {
        return (0.5 - Math.random()) * 2;
    }

    window._aiJerry = function (pack) {

        let me = pack.player;
        let xOfBall = pack.ball[0];
        let lOfBoard = me[0];
        let rOfBoard = me[0] + pack.board[1];
        let midOfBoard = (lOfBoard + rOfBoard) / 2;

        let yDistanceOfBall = Math.abs(pack.ball[1] - me[1]);
        let xVelocityOfBall = pack.speed[0];
        let yVelocityOfBall = pack.speed[1];

        let playgroundWidth = 350;
        let deltaXDistanceOfBall = 0;
        let totalXDistanceOfBall = Math.ceil(Math.abs(yDistanceOfBall / yVelocityOfBall * xVelocityOfBall));

        if (xVelocityOfBall > 0) deltaXDistanceOfBall = totalXDistanceOfBall - (playgroundWidth - xOfBall);
        else deltaXDistanceOfBall = totalXDistanceOfBall - xOfBall;

        let targetX = xOfBall;
        if (deltaXDistanceOfBall > 0) {
            // the ball will hit the side
            let reverse = (Math.floor(deltaXDistanceOfBall / playgroundWidth)) % 2 == 0 ? 1 : -1;
            deltaXDistanceOfBall %= playgroundWidth;

            if (reverse * xVelocityOfBall > 0) {
                // in the last round the ball shoot from the right
                targetX = playgroundWidth - deltaXDistanceOfBall;
            } else {
                // in the last round the ball shoot from the left
                targetX = deltaXDistanceOfBall;
            }
        } else {
            // the ball will not hit the side
            if (xVelocityOfBall > 0) targetX = xOfBall + totalXDistanceOfBall;
            else targetX = xOfBall - totalXDistanceOfBall;
        }

        // console.log(targetX);

        if (lOfBoard + 5 < targetX && targetX < rOfBoard - 5) {

            // Doing Aggressive Mode
            if (targetX < lOfBoard + 20) return 0.05;
            else if (lOfBoard - 20 < targetX) return -0.05;
            else return 0;

        } else {

            // Doing Conservative Mode
            if (targetX < midOfBoard) return -1;
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

        let verticalVelocity = ball.body.velocity.y;

        // Calculating the direction (-1 / 0 / 1) of ball
        let unit = 1;
        if (ball.body.velocity.y != 0) unit = parseInt(ball.body.velocity.y / Math.abs(ball.body.velocity.y));

        // Updating Vertical Speed
        ball.setVelocityY(verticalVelocity + 20 * unit);

        // Print debugging message
        if (VERBOSE) console.log("Current Speed: " + (verticalVelocity * unit));

    }

    /**
     * Actions when ball hits board
     * @param {object} ball
     * @param {object} board
     */
    function hitBall (ball, board) {

        let horizontalVelocity = 0;
        if (ball.body.x < board.body.x + 20) 
            horizontalVelocity = (ball.body.x - board.body.x - 20) / 20 * ball.body.velocity.y;
        else if (ball.body.x > board.body.x + board.width - 20) 
            horizontalVelocity = (ball.body.x - board.body.x - board.width + 20) / 20 * ball.body.velocity.y;
        ball.setVelocityX(horizontalVelocity);
        
        // Print debugging message
        if (VERBOSE) console.log("Hit");

    }

    /**
     * The Seed Reset Function
     * @param {int} seed 
     */
    function resetRandomSeed(seed) {
        window.Math.seed = parseInt(seed);
        window.Math.random = function(min, max) {
            min = min || 0; 
            max = max || 1;
            window.Math.seed = (window.Math.seed * 9301 + 49297) % 233280;
            var rnd = window.Math.seed / 233280.0;
            return min + rnd * (max - min);
        };
    }

    /**
     * Restart game
     */
    window.restartGame = function (seed=5) {
        ball.destroy();
        registerBall(seed % 2);
        resetRandomSeed(seed);
        gameState = 1;
    }

})();