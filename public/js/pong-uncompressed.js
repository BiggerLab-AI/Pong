Blockly.Blocks['return'] = {
    init: function() {
        this.appendValueInput('VALUE')
            .setCheck('Number')
            .appendField('Return');
        this.setPreviousStatement(true, 'Action');
        this.setColour(300);
        this.setTooltip('Returns if ball is on the leftside.');
    }
};

Blockly.Blocks['moveleft'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldLabel('Move Left'));
        this.setPreviousStatement(true, 'Action');
        this.setColour(300);
        this.setTooltip('Move Left.');
    }
};

Blockly.Blocks['moveright'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldLabel('Move Right'));
        this.setPreviousStatement(true, 'Action');
        this.setColour(300);
        this.setTooltip('Move Right.');
    }
};

Blockly.Blocks['movestop'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldLabel('Stop'));
        this.setPreviousStatement(true, 'Action');
        this.setColour(300);
        this.setTooltip('Stop the board.');
    }
};

Blockly.Blocks['mid_of_board'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldLabel('Position of Board'));
        this.setOutput(true, 'Number');
        this.setColour(260);
        this.setTooltip('Returns the Position of Board.');
    }
};

Blockly.Blocks['ball_ontheleft'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldLabel('Ball is on the LeftSide'));
        this.setOutput(true, 'Boolean');
        this.setColour(260);
        this.setTooltip('Returns if ball is on the leftside.');
    }
};

Blockly.Blocks['ball_ontheright'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldLabel('Ball is on the RightSide'));
        this.setOutput(true, 'Boolean');
        this.setColour(260);
        this.setTooltip('Returns if ball is on the rightside.');
    }
};

Blockly.Blocks['get_estimate_hit_time'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldLabel('Get Estimate Hit Time'));
        this.setOutput(true, 'Number');
        this.setColour(260);
        this.setTooltip('Returns the estimated time of hit.');
    }
};

Blockly.Blocks['get_predict_ball_target_x'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldLabel('Get Predict Ball Target X'));
        this.setOutput(true, 'Number');
        this.setColour(260);
        this.setTooltip('Returns the predicted X axis of the destination of the ball.');
    }
};

Blockly.Blocks['my_x'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldLabel('My X Position'));
        this.setOutput(true, 'Number');
        this.setColour(0);
        this.setTooltip('Returns My X Position.');
    }
};

Blockly.Blocks['my_y'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldLabel('My Y Position'));
        this.setOutput(true, 'Number');
        this.setColour(0);
        this.setTooltip('Returns My Y Position.');
    }
};

Blockly.Blocks['enemy_x'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldLabel('Enemy X Position'));
        this.setOutput(true, 'Number');
        this.setColour(30);
        this.setTooltip('Returns Enemy X Position.');
    }
};

Blockly.Blocks['enemy_y'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldLabel('Enemy Y Position'));
        this.setOutput(true, 'Number');
        this.setColour(30);
        this.setTooltip('Returns Enemy Y Position.');
    }
};

Blockly.Blocks['ball_x'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldLabel('Ball X Position'));
        this.setOutput(true, 'Number');
        this.setColour(60);
        this.setTooltip('Returns Ball X Position.');
    }
};

Blockly.Blocks['ball_y'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldLabel('Ball Y Position'));
        this.setOutput(true, 'Number');
        this.setColour(60);
        this.setTooltip('Returns Ball Y Position.');
    }
};

Blockly.Blocks['ball_speed_x'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldLabel('Ball Speed X'));
        this.setOutput(true, 'Number');
        this.setColour(60);
        this.setTooltip('Returns Ball Speed.');
    }
};

Blockly.Blocks['ball_speed_y'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldLabel('Ball Speed Y'));
        this.setOutput(true, 'Number');
        this.setColour(60);
        this.setTooltip('Returns Ball Speed.');
    }
};

Blockly.Blocks['board_length'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldLabel('Board Length'));
        this.setOutput(true, 'Number');
        this.setColour(100);
        this.setTooltip('Returns Board Length.');
    }
};

/********** Code ***********/

Blockly.JavaScript['return'] = function(block) {
    var argument0 = Blockly.JavaScript.valueToCode(block, 'VALUE',
        Blockly.JavaScript.ORDER_FUNCTION_CALL) || 0;
    return 'return ' + argument0 + ';\n';
};

Blockly.JavaScript['moveleft'] = function(block) {
    return 'actionSpace.moveLeft();\n';
};

Blockly.JavaScript['moveright'] = function(block) {
    return 'actionSpace.moveRight();\n';
};

Blockly.JavaScript['movestop'] = function(block) {
    return 'actionSpace.stop();\n';
};

Blockly.JavaScript['mid_of_board'] = function(block) {
    return ['currentState.player[0] + currentState.board[0] / 2', Blockly.JavaScript.ORDER_MEMBER];
};

Blockly.JavaScript['ball_ontheleft'] = function(block) {
    return ['currentState.ball[0] < currentState.player[0]', Blockly.JavaScript.ORDER_MEMBER];
};

Blockly.JavaScript['ball_ontheright'] = function(block) {
    return ['currentState.ball[0] > currentState.player[0] + currentState.board', Blockly.JavaScript.ORDER_MEMBER];
};

Blockly.JavaScript['get_estimate_hit_time'] = function(block) {
    return ['window.getEstimateHitTime(currentState)', Blockly.JavaScript.ORDER_MEMBER];
};

Blockly.JavaScript['get_predict_ball_target_x'] = function(block) {
    return [`window.getPreditBallTargetX(currentState)`, Blockly.JavaScript.ORDER_MEMBER];
};

Blockly.JavaScript['my_x'] = function(block) {
    return ['currentState.player[0]', Blockly.JavaScript.ORDER_MEMBER];
};

Blockly.JavaScript['my_y'] = function(block) {
    return ['currentState.player[1]', Blockly.JavaScript.ORDER_MEMBER];
};

Blockly.JavaScript['enemy_x'] = function(block) {
    return ['currentState.enemy[0]', Blockly.JavaScript.ORDER_MEMBER];
};

Blockly.JavaScript['enemy_y'] = function(block) {
    return ['currentState.enemy[1]', Blockly.JavaScript.ORDER_MEMBER];
};

Blockly.JavaScript['ball_x'] = function(block) {
    return ['currentState.ball[0]', Blockly.JavaScript.ORDER_MEMBER];
};

Blockly.JavaScript['ball_y'] = function(block) {
    return ['currentState.ball[1]', Blockly.JavaScript.ORDER_MEMBER];
};

Blockly.JavaScript['ball_speed_x'] = function(block) {
    return ['currentState.speed[0]', Blockly.JavaScript.ORDER_MEMBER];
};

Blockly.JavaScript['ball_speed_y'] = function(block) {
    return ['currentState.speed[1]', Blockly.JavaScript.ORDER_MEMBER];
};

Blockly.JavaScript['board_length'] = function(block) {
    return ['currentState.board[0]', Blockly.JavaScript.ORDER_MEMBER];
};