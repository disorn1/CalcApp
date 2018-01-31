const STATUS = { OK: 0, NOK: 1};

const CHANNEL = {
    CALCULATE: 'calculate',
    CALCULATE_REPLY: 'calculate_reply',
    SAVE: 'save',
    SAVE_REPLY: 'save_reply',
    LOAD: 'load',
    LOAD_REPLY: 'load_reply'
};

const OPRS = {
    ADD: 'add',
    SUB: 'sub',
    MUL: 'mul',
    DIV: 'div',
    POW: 'pow'
};

module.exports.STATUS = STATUS;
module.exports.CHANNEL = CHANNEL;
module.exports.OPRS = OPRS;
