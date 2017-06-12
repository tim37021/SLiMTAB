const remote = require("electron").remote;
const dialog = remote.dialog;
const fs = require("fs");
var assert = require("assert");
var pythonBridge = require("python-bridge");
const { ipcRenderer } = require("electron");

document.querySelector("#openfile").addEventListener("click", openDialog);
document.querySelector("#saveas").addEventListener("click", saveDialog);
document.querySelector("#recordbtn").addEventListener("click", record);
document.querySelector("#playbtn").addEventListener('click', play);
document.querySelector("#stopbtn").addEventListener("click", stop_record);
Array.from(document.getElementsByClassName("print")).forEach(function(x) {
  x.addEventListener("click", print);
});
Array.from(document.getElementsByClassName("set-note-length")).forEach(function(x) {
  x.addEventListener("click", set_note_length);
});

function openDialog() {
  var filename = dialog.showOpenDialog();
  fs.readFile(filename[0], (err, data) => {
    tag = new tabTag(filename[0].split(/(\\|\/)/g).pop());
    tag.load(JSON.parse(data));
    tabstrip.addTag(tag);
  });
}

function saveDialog() {
  dialog.showSaveDialog();
  alert("OK");
}

function msgbox(title, msg) {
  var msgbox = document.getElementById("msgbox");
  document.getElementById("msgtitle").innerHTML = title;
  document.getElementById("msgcontent").innerHTML = msg;
  msgbox.style.display = null;
}

python = checkPythonVersion();
function checkPythonVersion() {
  var commandExistsSync = require("command-exists").sync;
  var path = require("path");
  var python_cmd;
  if (commandExistsSync("python3")) python_cmd = "python3";
  else if (commandExistsSync("python")) python_cmd = "python";
  else {
    msgbox("錯誤", "需要安裝Python3才能啟用錄製功能");
    python = null;
    return;
  }
  try {
    var python = pythonBridge({ python: python_cmd });
    python.ex`
    import sys
    import os`;
    python`sys.version_info.major == 2`.then(x => {
      if (x) msgbox("錯誤", "Python版本不符，最低需求版本>=3.0.0");
      python = null;
    });
    python.ex`
    sys.path.append(${process.cwd()}+"/tools/SLiMTAB-backend")
    import SlimTabDriver
    import SlimTabManager
    manager=SlimTabManager.SlimTabManager()`;
    return python;
  } catch (err) {
    msgbox("錯誤", "未知異常而無法啟動錄製功能");
    python = null;
  }
}

function record() {
  var device = document.getElementById("comDeviceSelection").parentElement.children[0].innerHTML;
  python`SlimTabDriver.SliMTABDriver(${device}).check()`.then(x => {
    if (x) {
      python.ex`manager.setInputDevice(2)`;
      python.ex`manager.record()`;
    } else msgbox("錯誤", "沒有權限存取裝置或者裝置不存在");
  });
}

const Soundfont = require('soundfont-player');
function play() {

  var seq = tabstrip.operTb.paper.outputSequence();
  var ac = new AudioContext()
  Soundfont.instrument(ac, 'marimba', { soundfont: 'MusyngKite' }).then(function (marimba) {
    seq.forEach(x => {
      marimba.play(x['note'], x['time'], {duration: x['duration']})
    })
    setTimeout(function () {
      ac.close()
    }, seq[seq.length-1]['time']*1000);
  })

}

function stop_record() {
  python.ex`manager.stopRecord()`;
  python.ex`manager.saveCurrentRecordData()`;
  alert("YO");
}

function print() {
  cont = tabstrip.operTb.paper.content.cloneNode(true);
  cont.children[0].style.padding = "0px 3px 3px";
  ipcRenderer.send("print-document", cont.innerHTML);
  cont = null;
}

function set_note_length()
{
  tabstrip.operTb.paper.setNoteLength(parseInt(this.id.slice(2)));
}

/*
var checkDevices = setInterval(function() {
  if (python != null) {
    var audio = document.getElementById("audioDeviceSelection");
    if (audio.style.display == "none") {
      audio.innerHTML = "";
      python.ex`import SlimTabManager`;
      python`manager.getInputDevicesName()`.then(x => {
        x.forEach(function(name, index) {
          e = document.createElement("a");
          e.setAttribute("onclick", "this.parentElement.parentElement.children[0].innerHTML=this.innerHTML");
          e.innerHTML = name + ":" + index;

          audio.appendChild(e);
        });
        python`manager.getDefaultDevice()`.then(x => {
          if (audio.parentElement.children[0].innerHTML == "") {
            if (x["input"] != -1) audio.parentElement.children[0].innerHTML = audio.children[x["input"]].innerHTML;
            else audio.parentElement.children[0].innerHTML = "No input device";
          }
        });
      });
    } else clearInterval(checkDevices);
  }
}, 1000);