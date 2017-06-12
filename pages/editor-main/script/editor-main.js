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
document.querySelector("#recordbtn").addEventListener("click", record);
document.querySelector("#playbtn").addEventListener("click", play);
document.querySelector("#stopbtn").addEventListener("click", stop_record);
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
  var device = document.getElementById("comDeviceSelection").parentElement.children[0].innerHTML;
  python`SlimTabDriver.SliMTABDriver(${device}).check()`.then(x => {
    if (x) {
      python.ex`manager.setInputDevice(2)`;
      python.ex`manager.record()`;
    } else msgbox("錯誤", "沒有權限存取裝置或者裝置不存在");
  });
}

const Soundfont = require("soundfont-player");
function play() {
  var bpm = parseInt(document.getElementById("bpm_selection").innerHTML.split(" ")[0]);
  var seq = tabstrip.operTb.paper.outputSequence(bpm);
  /*Soundfont.instrument(ac, "marimba", { soundfont: "MusyngKite" }).then(function(marimba) {
    tabstrip.operTb.paper.play(bpm, ac);
    seq.forEach(x => {
      marimba.play(x["note"], x["time"], { duration: x["duration"] });
    });
    setTimeout(function() {
      console.log(ac.currentTime);
      ac.close();
    }, (seq[seq.length - 1]["time"] + seq[seq.length - 1]["duration"] + 3) * 1000);
  });*/
  //python.ex`print('fuck')`
  msgbox('訊息', '正在合成音訊請稍後..', true);
  python`synth.gen(${seq})`.then(() => {
    document.getElementById("msgbox").style.display = "none";
  })
  python.ex`synth.play()`
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
