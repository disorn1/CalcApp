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
var cloudDriveInput = document.getElementById("cloudDriveInput");
var userInputSection = document.getElementById("userInputSection");
var userInputField = document.getElementById("userInputField");
var loadingSection = document.getElementById("loadingSection");
var loadSaveSection = document.getElementById("loadSaveSection");

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

function onCloudDriveCheckboxClick() {
    if (cloudDriveInput.checked) {
        userInputSection.classList.remove('hide');
    } else {
        userInputSection.classList.add('hide');
    }
}

function onSaveButtonClick() {
    if (cloudDriveInput.checked) {
        saveCloud();
    } else {
        save();
    }
}

function onLoadButtonClick() {
    if (cloudDriveInput.checked) {
        loadCloud();
    } else {
        load();
    }
}

function save() {
    dialog.showSaveDialog(options= {
        title: "Save calculation",
        filters: [{name: 'Calculation file', extensions: ['cal']}]
    }, callback= (filename) => {
        if (filename) {
            var calState = {
                a: aInputField.value,
                b: bInputField.value,
                opr: currentOperator
            };
            ipcRenderer.send(CHANNEL.SAVE, calState, filename);
        }
    });
}

function load() {
    dialog.showOpenDialog(options={
        title: "Load calculation",
        filters: [{name: 'Calculation file', extensions: ['cal']}],
        properties: ["openFile"]
    }, callback= (filePaths) => {
        if (filePaths && filePaths.length > 0) {
            ipcRenderer.send(CHANNEL.LOAD, filePaths[0]);
        }
    });
}

function saveCloud() {
    if (userInputField.value) {
        var calState = {
            user: userInputField.value,
            a: aInputField.value,
            b: bInputField.value,
            opr: currentOperator
        };
        showLoading();
        ipcRenderer.send(CHANNEL.SAVE_CLOUD, calState);
        
    } else {
        dialog.showErrorBox('Save', 'Please enter username');
    }
}

function loadCloud() {
    if (userInputField.value) {
        showLoading();
        ipcRenderer.send(CHANNEL.LOAD_CLOUD, userInputField.value);
    } else {
        dialog.showErrorBox('Load', 'Please enter username');
    }
}

function clearCalculationResult() {
    resultInputField.value = '';
    clearOperandHighlight();
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

function showLoading() {
    loadSaveSection.classList.add('hide-loading');
    loadingSection.classList.remove('hide-loading');
}

function hideLoading() {
    loadSaveSection.classList.remove('hide-loading');
    loadingSection.classList.add('hide-loading');
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
    }
});

ipcRenderer.on(CHANNEL.LOAD_REPLY, (event, data) => {
    if (data.status === STATUS.OK) {
        aInputField.value = data.result.a != null ? data.result.a : '';
        bInputField.value = data.result.b != null ? data.result.b : '';
        if (data.result.opr && setOperandHighlight(data.result.opr) && aInputField.value && bInputField.value) {
            ipcRenderer.send(CHANNEL.CALCULATE, aInputField.value, bInputField.value, data.result.opr); 
        } else {
            clearCalculationResult();
        }
    } else {
        dialog.showErrorBox('Load failed', data.message);
    }
});

ipcRenderer.on(CHANNEL.SAVE_CLOUD_REPLY, (event, data) => {
    if (data.status === STATUS.NOK) {
        dialog.showErrorBox('Save failed', data.message);
    } else {
        dialog.showMessageBox({
            type: 'info',
            title: 'Save',
            message: 'Saved successfully'
        });
    }
    hideLoading();
});

ipcRenderer.on(CHANNEL.LOAD_CLOUD_REPLY, (event, data) => {
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
    hideLoading();
});

addButton.addEventListener('click', onCmdButtonClick);
subButton.addEventListener('click', onCmdButtonClick);
mulButton.addEventListener('click', onCmdButtonClick);
divButton.addEventListener('click', onCmdButtonClick);
powButton.addEventListener('click', onCmdButtonClick);
saveButton.addEventListener('click', onSaveButtonClick);
loadButton.addEventListener('click', onLoadButtonClick);
aInputField.addEventListener('change', clearCalculationResult);
bInputField.addEventListener('change', clearCalculationResult);
cloudDriveInput.addEventListener('click', onCloudDriveCheckboxClick);
