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

Blockly.Blocks['ball_speed'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldLabel('Ball Speed'));
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

Blockly.JavaScript['ball_ontheleft'] = function(block) {
    return ['pack.ball[0] < pack.player[0]', Blockly.JavaScript.ORDER_MEMBER];
};

Blockly.JavaScript['ball_ontheright'] = function(block) {
    return ['pack.ball[0] > pack.player[0] + pack.board', Blockly.JavaScript.ORDER_MEMBER];
};

Blockly.JavaScript['my_x'] = function(block) {
    return ['pack.player[0]', Blockly.JavaScript.ORDER_MEMBER];
};

Blockly.JavaScript['my_y'] = function(block) {
    return ['pack.player[1]', Blockly.JavaScript.ORDER_MEMBER];
};

Blockly.JavaScript['enemy_x'] = function(block) {
    return ['pack.enemy[0]', Blockly.JavaScript.ORDER_MEMBER];
};

Blockly.JavaScript['enemy_y'] = function(block) {
    return ['pack.enemy[1]', Blockly.JavaScript.ORDER_MEMBER];
};

Blockly.JavaScript['ball_x'] = function(block) {
    return ['pack.ball[0]', Blockly.JavaScript.ORDER_MEMBER];
};

Blockly.JavaScript['ball_y'] = function(block) {
    return ['pack.ball[1]', Blockly.JavaScript.ORDER_MEMBER];
};

Blockly.JavaScript['ball_speed'] = function(block) {
    return ['pack.speed[1]', Blockly.JavaScript.ORDER_MEMBER];
};

Blockly.JavaScript['board_length'] = function(block) {
    return ['pack.board', Blockly.JavaScript.ORDER_MEMBER];
};