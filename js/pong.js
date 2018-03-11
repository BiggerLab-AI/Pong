var SCALE = 40;
var ISC   = 2;
var config = {
    type: Phaser.AUTO,
    width: 9 * SCALE,
    height: 16 * SCALE,
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

var game = new Phaser.Game(config);
var that;
var vol = 250;

var cursors,
    whitespace,
    esc,
    player,
    enemy,
    ball,
    enemyDeadField,
    playerDeadField,
    gameText,
    hintText,
    stepper,
    aifunc = null,
    gameState = 0;

const HINTTEXT = 'WhiteSpace to Start, Esc to Pause,\n        ← or → to Move.';

/**
 * gameState:
 * 0: pausing
 * 1: playing
 * 2: I am winner
 * 3: I am loser
 */

function preload () {
    this.load.image('starfield', 'assets/starfield.png');
    this.load.image('paddle', 'assets/paddle.png');
    this.load.image('ball', 'assets/ball.png');
    this.load.image('boundary', 'assets/deadline.png');
}

function create () {
    this.add.tileSprite(0, 0, 9 * SCALE * ISC, 16 * SCALE * ISC, 'starfield');

    that   = this;
    enemy  = this.physics.add.sprite(9 * SCALE / 2, 20, 'paddle');
    player = this.physics.add.sprite(9 * SCALE / 2, 16 * SCALE - 20, 'paddle');

    enemyDeadField = this.physics.add.sprite(0, 0, 'boundary');
    playerDeadField = this.physics.add.sprite(0, 16 * SCALE, 'boundary');

    enemyDeadField.body.immovable = true;
    playerDeadField.body.immovable = true;

    player.setBounce(0);
    player.setCollideWorldBounds(true);
    player.body.immovable = true;
    enemy.setBounce(0);
    enemy.setCollideWorldBounds(true);
    enemy.body.immovable = true;

    ball = this.physics.add.sprite(9 * SCALE / 2, 16 * SCALE / 2, 'ball');
    ball.setBounce(1);
    ball.setCollideWorldBounds(true);
    ball.setVelocityY(vol * -1);
    ball.setVelocityX(parseInt(150 - Math.random() * 300));

    stepper = this.physics.add.sprite(0, 16 * SCALE / 2, 'boundary');

    cursors = this.input.keyboard.createCursorKeys();
    whitespace = this.input.keyboard.addKey(32);
    esc = this.input.keyboard.addKey(27);

    gameText = this.add.text(9 * SCALE / 2 - 90, 16 * SCALE / 2 - 20, ' PAUSING  ', { fontSize: '32px', fill: '#FFF' });
    hintText = this.add.text(9 * SCALE / 2 - 100, 16 * SCALE / 2 + 30, HINTTEXT, { fontSize: '10px', fill: '#CCC' });

    this.physics.add.collider(ball, player, hitBall, null, this);
    this.physics.add.collider(ball, enemy , hitBall, null, this);

    this.physics.add.collider(ball, enemyDeadField, hitWall, null, this);
    this.physics.add.collider(ball, playerDeadField, hitWall, null, this);

    this.physics.add.overlap(ball, stepper, addSpeed, null, this);
}

function update () {

    if (whitespace.isDown && gameState == 0) gameState = 1;
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

    if (esc.isDown) {
        gameState = 0;
        return;
    }

    callAI(enemy, sampleAI);

    if (aifunc !== null) {
        callAI(player, aifunc);
        return;
    }

    if (cursors.left.isDown) {
        player.setVelocityX(-150);
    } else if (cursors.right.isDown) {
        player.setVelocityX(150);
    } else {
        player.setVelocityX(0);
    }

}

function callAI(ob, fn) {
    let aiPack = {
        "ball":   [ball.body.x, ball.body.y],
        "player": [player.body.x, player.body.y],
        "enemy":  [enemy.body.x, enemy.body.y],
        "board":  player.width,
    }
    let res = parseFloat(fn(aiPack));
    if (isNaN(res)) res = 0;
    if (Math.abs(res) > 1) res = 0;
    ob.setVelocityX(res * 150);
}

function sampleAI(pack) {
    if (pack.ball[0] < pack.enemy[0]) return -1;
    else if (pack.ball[0] > pack.enemy[0] + pack.board) return 1;
    else return 0;
}

function hitWall (b, w) {
    if (w == playerDeadField) gameState = 3;
    else if (w == enemyDeadField) gameState = 2;
}

function addSpeed(b, s) {
    vol += 5;
    let unit = 1;
    if (ball.body.velocity.y != 0) unit = parseInt(ball.body.velocity.y / Math.abs(ball.body.velocity.y));
    ball.setVelocityY(vol * unit);
    console.log("Current Speed: " + (vol * unit));
}

function hitBall (b, p) {
    if (b.body.x < p.body.x + 20) ball.setVelocityX((b.body.x - p.body.x - 20) * 8);
    else if (b.body.x > p.body.x + p.width - 20) ball.setVelocityX((b.body.x - p.body.x - p.width + 20) * 8);
    console.log("Hit");
}