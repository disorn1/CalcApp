const {ipcMain} = require('electron');
const fs = require('fs');
const {STATUS, CHANNEL, OPRS} = require('./calculator-model');

ipcMain.on(CHANNEL.CALCULATE, (event, a, b, opr) => {
    try {
        var result = calculate(a, b, opr);
        event.sender.send(CHANNEL.CALCULATE_REPLY, {
            status: STATUS.OK,
            result: result
        });
    } catch (e) {
        event.sender.send(CHANNEL.CALCULATE_REPLY,{
            status: STATUS.NOK,
            message: errMsg(e)
        });
    }
});

ipcMain.on(CHANNEL.SAVE, (event, calState, filename) => {
    save(calState, filename, (err) => {
        if (err) {
            event.sender.send(CHANNEL.SAVE_REPLY,{
                status: STATUS.NOK,
                message: errMsg(err)
            });
        } else {
            event.sender.send(CHANNEL.SAVE_REPLY, {
                status: STATUS.OK,
                result: filename
            });
        }
    });
});

ipcMain.on(CHANNEL.LOAD, (event, filename) => {
    load(filename, (err, data) => {
        if (!err) {
            validateLoadInput(data);
            event.sender.send(CHANNEL.LOAD_REPLY, {
                status: STATUS.OK,
                result: data
            });
        } else {
            event.sender.send(CHANNEL.LOAD_REPLY,{
                status: STATUS.NOK,
                message: errMsg(err)
            });
        }
    });
});

function validateLoadInput(data) {
    if (data.a != null) {
        var a = parseFloat(data);
        if (!isNaN(a)) {
            data.a = a;
        }
    }
    if (data.b != null) {
        var b = parseFloat(data);
        if (!isNaN(b)) {
            data.b = b;
        }
    }
}

function calculate(a, b, opr) {
    var _a = parseFloat(a);
    var _b = parseFloat(b);
    var result;
    switch (opr) {
        case OPRS.ADD:
            result =  _a + _b;
            break;
        case OPRS.SUB:
            result = _a - _b;
            break;
        case OPRS.MUL:
            result = _a * _b;
            break;
        case OPRS.DIV:
            result = _a / _b;
            break;
        case OPRS.POW:
            result = Math.pow(_a, _b);
            break;
        default:
            throw 'unsupport operation';
    }
    if (!isFinite(result)) {
        if (isNaN(result)) {
            return 'NaN';
        }
        return 'Infinite';
    }
    return result;
}

function save(calcState, filename, callback) {
    try {
        var serializedCalcState = JSON.stringify(calcState);
        fs.writeFile(filename, serializedCalcState, callback);
    } catch (e) {
        callback(e);
    }
}

function load(filename, callback) {
    fs.readFile(filename, function (err, data) {
        if (err) {
            callback(err);
        } else {
            try {
                obj = JSON.parse(data);
                callback(err=undefined, data=obj);
            }
            catch (e) {
                callback(e);
            }
        }
    });
}

function errMsg(e) {
    return e.message ? e.message : e;
}
