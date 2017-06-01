const remote = require('electron').remote; 
const dialog = remote.dialog;

document.querySelector('#openfile').addEventListener('click', openDialog)
document.querySelector('#saveas').addEventListener('click', saveDialog)
document.querySelector('#recordbtn').addEventListener('click', record)
document.querySelectorAll('#printbtn').forEach(function (x) {x.addEventListener('click', print)})

function openDialog() {
  dialog.showOpenDialog()
}

function saveDialog() {
  dialog.showSaveDialog()
  alert("OK")
}

function record() {
  var assert = require('assert');
  var pythonBridge = require('python-bridge')
  var python = pythonBridge({python: 'python3', env: {PYTHONPATH: './tools'}})

  python.ex`import slimtabdriver`
  python`slimtabdriver.SliMTABDriver("/dev/ttyUSB0").check()`.then(x => {if(!x) alert("沒有權限存取裝置或者裝置不存在")})
  python`slimtabdriver.list_com_ports()`.then(x => console.log(x))
  python.end()
}

function print() {
  webview.print()
}

