const remote = require("electron").remote;
const dialog = remote.dialog;
const fs = require("fs");
var assert = require("assert");
var pythonBridge = require("python-bridge");
const { ipcRenderer } = require("electron");

Array.from(document.getElementsByClassName("open")).forEach(x =>{
  x.addEventListener("click", openDialog);
});
Array.from(document.getElementsByClassName("saveas")).forEach(x => {
  x.addEventListener("click", saveDialog);
});
Array.from(document.getElementsByClassName("record")).forEach(x => {
  x.addEventListener("click", record);
});
Array.from(document.getElementsByClassName("stop-record")).forEach(x => {
  x.addEventListener("click", stop_record);
});
document.querySelector("#playbtn").addEventListener("click", play);
document.querySelector("#stopbtn").addEventListener("click", stop);
Array.from(document.getElementsByClassName("print")).forEach(function(x) {
  x.addEventListener("click", print);
});
Array.from(document.getElementsByClassName("set-note-length")).forEach(function(x) {
  x.addEventListener("click", set_note_length);
});

function openfile(filename) {
  console.log("FUCK");
  fs.readFile(filename, (err, data) => {
    tag = new tabTag(filename.split(/(\\|\/)/g).pop());
    tag.load(JSON.parse(data));
    tabstrip.addTag(tag);
  });
}

function openDialog() {
  var filename = dialog.showOpenDialog();
  openfile(filename[0]);
}

function saveDialog() {
  var filename = dialog.showSaveDialog();
  fs.writeFileSync(filename, JSON.stringify(tabstrip.operTb.paper.data));
}

function msgbox(title, msg, no_ok=false) {
  var msgbox = document.getElementById("msgbox");
  document.getElementById("msgtitle").innerHTML = title;
  document.getElementById("msgcontent").innerHTML = msg;
  if(no_ok)
    msgbox.getElementsByClassName('okbtn')[0].style.display = "none";
  else
    msgbox.getElementsByClassName('okbtn')[0].style.display = null;
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
    import AudioSynth
    manager=SlimTabManager.SlimTabManager()
    synth=AudioSynth.AudioSynth()`;
    return python;
  } catch (err) {
    msgbox("錯誤", "未知異常而無法啟動錄製功能");
    python = null;
  }
}

function record() {
  //python.ex`manager.setInputDevice(manager.getDefaultDevice()['input'])`;
  document.getElementById('recordbtn').style.display = "none";
  document.getElementById('stoprecordbtn').style.display = null;
  python.ex`manager.record()`;
}

let ac;
let ins;
const Soundfont = require("soundfont-player");
function play() {
  document.getElementById('playbtn').style.display = "none";
  document.getElementById('stopbtn').style.display = null;
  var bpm = parseInt(document.getElementById("bpm_selection").innerHTML.split(" ")[0]);
  var seq = tabstrip.operTb.paper.outputSequence(bpm);
  tabstrip.operTb.paper.event['play-finished'] = (x) => {
    stop();
  }
  ac = new AudioContext();
  Soundfont.instrument(ac, "./soundfont/electric_guitar_clean.js").then(function(instrument) {
    tabstrip.operTb.paper.play(bpm, ac);
    seq.forEach(x => {
      instrument.play(x["note"], x["time"], { duration: x["duration"] });
    });
    ins = instrument;
  });
  //python.ex`print('fuck')`
  //msgbox('訊息', '正在合成音訊請稍後..', true);
  //python`synth.gen(${seq})`.then(() => {
  //  document.getElementById("msgbox").style.display = "none";
  //})
 //python.ex`synth.play()`
}

function stop_record() {
  document.getElementById('recordbtn').style.display = null;
  document.getElementById('stoprecordbtn').style.display = "none";
  python.ex`manager.stopRecord()`;

  msgbox('訊息', '正在計算...請稍後..', true);
  var bpm = parseInt(document.getElementById("bpm_selection").innerHTML.split(" ")[0]);
  python`manager.calc(bpm=${bpm})`.then(x => {
    tabstrip.operTb.paper.data = x;
    console.log(x)
    tabstrip.operTb.paper.render();
    document.getElementById("msgbox").style.display = "none";
  });
}

function stop() {
  document.getElementById('playbtn').style.display = null;
  document.getElementById('stopbtn').style.display = "none";
  if(ins) {
    ins.stop();
    ac.close();
    tabstrip.operTb.paper.stop();
    ins = null;
    ac = null;
  }
  tabstrip.operTb.paper.stop();
}

function print() {
  cont = tabstrip.operTb.paper.content.cloneNode(true);
  cont.children[0].style.padding = "0px 3px 3px";
  ipcRenderer.send("print-document", cont.innerHTML);
  cont = null;
}

function set_note_length() {
  tabstrip.operTb.paper.setNoteLength(parseInt(this.id.slice(2)));
}


ipcRenderer.on("open", function(event, args) {
  console.log(args.split('///')[1]);
  openfile(args.split('///')[1]);
})

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
}, 1000);*/
