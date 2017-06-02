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

python_cmd = checkPythonVersion()
function checkPythonVersion() {
  try {
    var python = pythonBridge({python: 'python3', env: {PYTHONPATH: './tools'}})
    python.end()
    return 'python3'
  } catch (err) {
  }
  try {
    var python = pythonBridge({python: 'python', env: {PYTHONPATH: './tools'}})
    python.ex`import sys`
    python`sys.version_info.major == 2`.then(x => {
    if(x)
      msgbox("錯誤", "Python版本不符，最低需求版本>=3.0.0")
    })
    python.end()
    return 'python'
  } catch (err) {
    msgbox("錯誤", "Python尚未安裝，最低需求版本>=3.0.0")
  }
  return undefined
}

function record() {
  var device = document.getElementById('comDeviceSelection').parentElement.children[0].innerHTML
  var python = pythonBridge({python: python_cmd, env: {PYTHONPATH: './tools/SLiMTAB-backend'}})
  python.ex`import SlimTabDriver`
  python`SlimTabDriver.SliMTABDriver(${device}).check()`.then(x => {if(!x) msgbox("錯誤", "沒有權限存取裝置或者裝置不存在")})
  python.end()
}

function print() {
  webview.print()
}

setInterval(function() {
  var com = document.getElementById('comDeviceSelection')
  var python = pythonBridge({python: python_cmd, env: {PYTHONPATH: './tools/SLiMTAB-backend'}})
  if(com.style.display == "none") {
    com.innerHTML = ''
    python.ex`import SlimTabDriver`
    python`SlimTabDriver.list_com_ports()`.then(x => {
      x.forEach(function (name) {
        e = document.createElement("a");
        e.setAttribute('onclick', 'this.parentElement.parentElement.children[0].innerHTML=this.innerHTML')
        e.innerHTML = name
        com.appendChild(e)
      })
    })
  }
  var audio = document.getElementById('audioDeviceSelection')
  if(audio.style.display == "none") {
    audio.innerHTML = ''
    python.ex`import SlimTabManager`
    python`SlimTabManager.SlimTabManager().getInputDevicesName()`.then(x => {
      x.forEach(function (name) {
        e = document.createElement("a");
        e.setAttribute('onclick', 'this.parentElement.parentElement.children[0].innerHTML=this.innerHTML')
        e.innerHTML = name
        audio.appendChild(e)
      })
    })
  }
  python.end()
}, 1000)