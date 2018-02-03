var express = require('express');
var state = require('./state');
var bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());       
app.use(bodyParser.urlencoded({ extended: true })); 

app.get('/api/calcState', function(req, res) {
    var userName = req.query.user;
    var response;
    if (userName) {
        state.getCalcStateByUsername(userName, (err, document) => {
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
        state.setCalcState(user, aInput, bInput, opr, (err, result) => {
            if (err) {
                res.send(errResponse(err));
            } else {
                res.send(successResponse(result));
            }
        });
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
    };
    return res;
}
function errResponse(message) {
    var res = {
        status: 'NOK',
        message: message
    };
    return res;
}

function startServer() {
    const server = app.listen(80, () => {
        var host = server.address().address;
        var port = server.address().port;
        console.log(("  App is running at listening at http://%s:%s"), host, port);
        console.log("  Press CTRL-C to stop\n");
    });
}

exports.initializeDB = initializeDB;
exports.startServer = startServer;
