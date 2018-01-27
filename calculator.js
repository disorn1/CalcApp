const {ipcMain} = require('electron');

ipcMain.on('calculate', (event, a, b, opr) => {
    try {
        var result = calculate(a, b, opr);
        event.sender.send('calculate-reply',{
            status: 'ok',
            result: result
        });
    }
    catch (e) {
        event.sender.send('calculate-reply',{
            status: 'nok',
            message: e.message ? e.message : e
        });
    }
});

function calculate(a, b, cmd) {
    var a = parseFloat(a);
    var b = parseFloat(b);

    var result;
    switch (cmd) {
        case "add":
            result =  a + b;
            break;
        case "minus":
            result = a - b;
            break;
        case "mul":
            result = a * b;
            break;
        case "div":
            result = a / b;
            break;
        case "pow":
            result = Math.pow(a, b);
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
