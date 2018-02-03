const {ipcRenderer} = require('electron');
const {dialog} = require('electron').remote;
const {STATUS, CHANNEL, OPRS} = require('../calculator-model');

var aInputField = document.getElementById("aInputField");
var bInputField = document.getElementById("bInputField");
var addButton = document.getElementById("addButton");
var subButton = document.getElementById("subButton");
var mulButton = document.getElementById("mulButton");
var divButton = document.getElementById("divButton");
var powButton = document.getElementById("powButton");
var loadButton = document.getElementById("loadButton");
var saveButton = document.getElementById("saveButton");
var resultInputField = document.getElementById("resultInputField");
var userInputField = document.getElementById("userInputField");

var currentOperator;

function onCmdButtonClick(event) {
    if (aInputField.value && bInputField.value) {
        currentOperator = event.target.getAttribute('cmd');
        setOperandHighlight(currentOperator);
        ipcRenderer.send(CHANNEL.CALCULATE, aInputField.value, bInputField.value, currentOperator);  
    } else {
        resultInputField.value = '';
    }
}

function onSaveButtonClick() {
    if (userInputField.value) {
        var calState = {
            user: userInputField.value,
            a: aInputField.value,
            b: bInputField.value,
            opr: currentOperator
        };
        ipcRenderer.send(CHANNEL.SAVE, calState);
        
    } else {
        dialog.showErrorBox('Save', 'Please enter username');
    }
}

function onLoadButtonClick() {
    if (userInputField.value) {
        ipcRenderer.send(CHANNEL.LOAD, userInputField.value);
    } else {
        dialog.showErrorBox('Load', 'Please enter username');
    }
}

function clearOperandHighlight() {
    addButton.classList.remove("selected");
    subButton.classList.remove("selected");
    mulButton.classList.remove("selected");
    divButton.classList.remove("selected");
    powButton.classList.remove("selected");
}

function setOperandHighlight(opr) {
    clearOperandHighlight();
    switch (opr) {
        case OPRS.ADD:
            addButton.classList.add('selected');
            return true;
        case OPRS.SUB:
            subButton.classList.add('selected');
            return true;
        case OPRS.MUL:
            mulButton.classList.add('selected');
            return true;
        case OPRS.DIV:
            divButton.classList.add('selected');
            return true;
        case OPRS.POW:
            powButton.classList.add('selected');
            return true;
    }
}

ipcRenderer.on(CHANNEL.CALCULATE_REPLY, (event, data) => {
    if (data.status === STATUS.OK) {
        resultInputField.value = data.result;
    } else if (data.status === STATUS.NOK){
        resultInputField.value = '';
        clearOperandHighlight();
        dialog.showErrorBox('Calculation failed', data.message);
    }
});

ipcRenderer.on(CHANNEL.SAVE_REPLY, (event, data) => {
    if (data.status === STATUS.NOK) {
        dialog.showErrorBox('Save failed', data.message);
    } else {
        dialog.showMessageBox({
            type: 'info',
            title: 'Save',
            message: 'Saved successfully'
        });
    }
});

ipcRenderer.on(CHANNEL.LOAD_REPLY, (event, data) => {
    if (data.status === STATUS.OK) {
        aInputField.value = data.result.a != null ? data.result.a : '';
        bInputField.value = data.result.b != null ? data.result.b : '';
        if (data.result.opr && setOperandHighlight(data.result.opr) && aInputField.value && bInputField.value) {
            ipcRenderer.send(CHANNEL.CALCULATE, aInputField.value, bInputField.value, data.result.opr); 
        } else {
            resultInputField.value = '';
            clearOperandHighlight();
        }
        dialog.showMessageBox({
            type: 'info',
            title: 'Load',
            message: 'Loaded successfully'
        });
    } else {
        dialog.showErrorBox('Load failed', data.message);
    }
});

addButton.addEventListener('click', onCmdButtonClick);
subButton.addEventListener('click', onCmdButtonClick);
mulButton.addEventListener('click', onCmdButtonClick);
divButton.addEventListener('click', onCmdButtonClick);
powButton.addEventListener('click', onCmdButtonClick);
saveButton.addEventListener('click', onSaveButtonClick);
loadButton.addEventListener('click', onLoadButtonClick);
