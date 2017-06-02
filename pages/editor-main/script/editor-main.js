const remote = require('electron').remote; 
const dialog = remote.dialog;
var assert = require('assert');
var pythonBridge = require('python-bridge')


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

function msgbox(title, msg) {
  var msgbox = document.getElementById('msgbox')
  document.getElementById('msgtitle').innerHTML = title;
  document.getElementById('msgcontent').innerHTML = msg;
  msgbox.style.display = null
}

function record() {
  var device = document.getElementById('deviceSelection').parentElement.children[0].innerHTML
  console.log(device)
  var python = pythonBridge({python: 'python3', env: {PYTHONPATH: './tools'}})
  python.ex`import slimtabdriver`
  python`slimtabdriver.SliMTABDriver(${device}).check()`.then(x => {if(!x) msgbox("錯誤", "沒有權限存取裝置或者裝置不存在")})
  python.end()
}

function print() {
  webview.print()
}

setInterval(function() {
  var selection = document.getElementById('deviceSelection')
  if(selection.style.display == "none") {
    var python = pythonBridge({python: 'python3', env: {PYTHONPATH: './tools'}})
    selection.innerHTML = ''
    python.ex`import slimtabdriver`
    python`slimtabdriver.list_com_ports()`.then(x => {
      x.forEach(function (name) {
        e = document.createElement("a");
        e.setAttribute('onclick', 'this.parentElement.parentElement.children[0].innerHTML=this.innerHTML')
        e.innerHTML = name
        selection.appendChild(e)
      })
    })
  }
}, 1000)