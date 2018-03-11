Blockly.Blocks['return'] = {
    init: function() {
        this.appendValueInput('VALUE')
            .setCheck('Number')
            .appendField('Return');
        this.setPreviousStatement(true, 'Action');
        this.setColour(100);
        this.setTooltip('Returns if ball is on the leftside.');
    }
};

Blockly.Blocks['ball_ontheleft'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldLabel('Ball is on the LeftSide'));
        this.setOutput(true, 'Boolean');
        this.setColour(100);
        this.setTooltip('Returns if ball is on the leftside.');
    }
};

Blockly.Blocks['ball_ontheright'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldLabel('Ball is on the RightSide'));
        this.setOutput(true, 'Boolean');
        this.setColour(100);
        this.setTooltip('Returns if ball is on the rightside.');
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