const {ipcRenderer} = require('electron');
const {dialog} = require('electron').remote;

var aInputField = document.getElementById("aInputField");
var bInputField = document.getElementById("bInputField");
var addButton = document.getElementById("addButton");
var minusButton = document.getElementById("minusButton");
var mulButton = document.getElementById("mulButton");
var divButton = document.getElementById("divButton");
var powButton = document.getElementById("powButton");
var loadButton = document.getElementById("loadButton");
var saveButton = document.getElementById("saveButton");
var resultInputField = document.getElementById("resultInputField");

var onCmdButtonClick = function(event) {
    ipcRenderer.send('calculate', aInputField.value, bInputField.value, event.target.getAttribute('cmd'));
};

ipcRenderer.on('calculate-reply', (event, data) => {
    if (data.status === 'ok') {
        resultInputField.value = data.result;
    }
    else if (data.status === 'nok'){
        resultInputField.value = ''
        dialog.showMessageBox(options={type: 'error', title: 'Calculation failed', message: data.message})
    }
});

addButton.addEventListener('click', onCmdButtonClick);
minusButton.addEventListener('click', onCmdButtonClick);
mulButton.addEventListener('click', onCmdButtonClick);
divButton.addEventListener('click', onCmdButtonClick);
powButton.addEventListener('click', onCmdButtonClick);
