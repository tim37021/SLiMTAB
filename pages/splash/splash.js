const {ipcRenderer} = require('electron')

setTimeout(
  function() {
    ipcRenderer.send('splash-timeout', 'ping');
  }
  , 1000
);
