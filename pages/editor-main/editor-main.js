const remote = require('electron').remote; 
const dialog = remote.dialog;

document.querySelector('#openfile').addEventListener('click', openDialog)
document.querySelector('#saveas').addEventListener('click', saveDialog)

function openDialog() {
  dialog.showOpenDialog()
}

function saveDialog() {
  dialog.showSaveDialog()
}