const { ipcRenderer } = require('electron')    

global.pingHost = () => {
  ipcRenderer.sendToHost('ping')
}