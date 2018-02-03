const {ipcMain} = require('electron');
const fs = require('fs');
const request = require('request');
const {STATUS, CHANNEL, OPRS} = require('./calculator-model');

const serviceHost = "35.229.57.112";
const saveEndpoint = 'http://' + serviceHost + '/api/setCalcState';
const loadEndpoint = 'http://' + serviceHost + '/api/calcState';

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

ipcMain.on(CHANNEL.SAVE_CLOUD, (event, calState) => {
    saveCloud(calState, (err) => {
        if (err) {
            event.sender.send(CHANNEL.SAVE_CLOUD_REPLY,{
                status: STATUS.NOK,
                message: errMsg(err)
            });
        } else {
            event.sender.send(CHANNEL.SAVE_CLOUD_REPLY, {
                status: STATUS.OK,
                result: calState
            });
        }
    });
});

ipcMain.on(CHANNEL.LOAD_CLOUD, (event, user) => {
    loadCloud(user, (err, data) => {
        if (!err) {
            validateLoadInput(data);
            event.sender.send(CHANNEL.LOAD_CLOUD_REPLY, {
                status: STATUS.OK,
                result: data
            });
        } else {
            event.sender.send(CHANNEL.LOAD_CLOUD_REPLY,{
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

function saveCloud(calcState, callback) {
    var headers = {
        'Content-Type': 'application/json'
    };
    
    var options = {
        url: saveEndpoint,
        method: 'POST',
        headers: headers,
        form: {
            'user' : calcState.user,
            'a': calcState.a,
            'b': calcState.b,
            'opr' : calcState.opr
        }
    };
    
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            try {
                var resObj = JSON.parse(body);
                if (resObj.status === "OK") {
                    callback(); //succeed
                } else {
                    callback(resObj.message);
                }
            }
            catch (e) {
                callback('Cannot parse response, ' + e.message);
            }
        } else {
            if (error) {
                callback(error.message);
            }
            else if (response) {
                callback(null, 'Server returned: ' + response.statusCode + ": " + response.statusMessage);
            }
        }
    });
}

function loadCloud(user, callback) {
    var options = {
        url: loadEndpoint,
        method: 'GET',
        qs: {'user': user}
    };

    request(options, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            try {
                var resObj = JSON.parse(body);
                if (resObj.status === 'OK') {
                    if (resObj.data) {
                        callback(null, resObj.data); //succeed
                    } else {
                        callback('Username not found');
                    }
                    
                } else {
                    callback(resObj.message);
                }
            } catch (e) {
                callback('Cannot parse response, ' + e.message);
            }
        }
        else {
            if (error) {
                callback(error.message);
            }
            else if (response) {
                callback(null, 'Server returned: ' + response.statusCode + ": " + response.statusMessage);
            }
        }
    });
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
