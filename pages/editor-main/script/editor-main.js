const remote = require('electron').remote; 
const dialog = remote.dialog;
const fs = require('fs')
var assert = require('assert');
var pythonBridge = require('python-bridge')

document.querySelector('#openfile').addEventListener('click', openDialog)
document.querySelector('#saveas').addEventListener('click', saveDialog)
document.querySelector('#recordbtn').addEventListener('click', record)
document.querySelector('#stopbtn').addEventListener('click', stop_record)
document.querySelectorAll('#printbtn').forEach(function (x) {x.addEventListener('click', print)})

function openDialog() {
  var filename = dialog.showOpenDialog()
  fs.readFile(filename[0], (err, data) => {
    tp = new TabPaper()
    document.getElementById("tabpaper1").appendChild(tp.content);
    tp.load(JSON.parse(data))
    tp.render()
    tabstrip.addTag(new tabTag(filename[0].split(/(\\|\/)/g).pop(), tp))
    tabstrip.render()
    tp.content.dispatchEvent(new Event("click"));//pretend the tab to be clicked
  })
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

python = checkPythonVersion()
function checkPythonVersion() {
  try {
    var python = pythonBridge({python: 'python3', env: {PYTHONPATH: './tools/SLiMTAB-backend'}})
    python.ex`import SlimTabDriver`
    python.ex`import SlimTabManager`
    python.ex`manager=SlimTabManager.SlimTabManager()`
    return python
  } catch (err) {
  }
  try {
    var python = pythonBridge({python: 'python', env: {PYTHONPATH: './tools/SLiMTAB-backend'}})
    python.ex`import sys`
    python`sys.version_info.major == 2`.then(x => {
    if(x)
      msgbox("錯誤", "Python版本不符，最低需求版本>=3.0.0")
    })
    python.ex`import SlimTabDriver`
    python.ex`import SlimTabManager`
    python.ex`manager=SlimTabManager.SlimTabManager()`
    return python
  } catch (err) {
    msgbox("錯誤", "Python尚未安裝，最低需求版本>=3.0.0")
  }
}

function record() {
  var device = document.getElementById('comDeviceSelection').parentElement.children[0].innerHTML
  python`SlimTabDriver.SliMTABDriver(${device}).check()`.then(x => {
    if(x) {
      python.ex`manager.setInputDevice(2)`
      python.ex`manager.record()`
    } else
      msgbox("錯誤", "沒有權限存取裝置或者裝置不存在")
  })
}

function stop_record() {
  python.ex`manager.stopRecord()`
  python.ex`manager.saveCurrentRecordData()`
  alert("YO")
}

function print() {
  webview.print()
}

setInterval(function() {
  var com = document.getElementById('comDeviceSelection')
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
    python`manager.getInputDevicesName()`.then(x => {
      x.forEach(function (name, index) {
        e = document.createElement("a");
        e.setAttribute('onclick', 'this.parentElement.parentElement.children[0].innerHTML=this.innerHTML')
        e.innerHTML = name + ':' + index
        
        audio.appendChild(e)
      })
    })
  }
}, 1000)