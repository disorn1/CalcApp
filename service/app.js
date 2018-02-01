var app = require('express');
var state = require('./state');
var bodyParser = require('body-parser');

app.use( bodyParser.json() );       
app.use(bodyParser.urlencoded({ extended: true })); 

app.get('/api/calcState', function(req, res) {
    var userName = req.param('user');
    var response;
    if (userName) {
        state.getCalcStateByUsername(user, (err, document) => {
            var response;
            if (!err) {
                response = successResponse(document);
            } else {
                response = errResponse(err.message ? err.message : err);
            }
            responseStr = JSON.stringify(response);
            res.send(responseStr);
        });
    } else {
        res.send(errResponse("No username"));
    }
});

app.post('/api/setCalcState', function(req, res) {
    var user = req.body.user;
    var aInput = req.body.a;
    var bInput = req.body.b;
    var opr = req.body.opr;
    if (user) {
        if (aInput === null || aInput === undefined) {
            aInput = parseFloat(aInput);
            if (isNaN(aInput)) {
                aInput = null;
            }
        }
        if (bInput === null || bInput === undefined) {
            bInput = parseFloat(bInput);
            if (isNaN(bInput)) {
                bInput = null;
            }
        }
        if (opr === null || opr === undefined) {
            opr = null;
        }
        state.setCalcState(user, aInput, bInput, opr);
    } else {
        res.send(errResponse("No username"));
    }
});

function initializeDB(callback) {
    state.connect(callback);
}

function successResponse(data) {
    var res = {
        status: 'OK',
        data: data
    }
    return res;
}
function errResponse(message) {
    var res = {
        status: 'NOK',
        message: message
    }
    return res;
}

exports.initializeDB = initializeDB;