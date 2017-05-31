const electron = require('electron')
const ipcMain = electron.ipcMain
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')

let splashWindow
let editorWindow

function createSplash () {
  // Create the browser window.
  splashWindow = new BrowserWindow({width: 621, height: 421, frame: false})

  // and load the index.html of the app.
  splashWindow.loadURL(url.format({
    pathname: path.join(__dirname, "pages", "splash" , "splash.html"),
    protocol: 'file:',
    slashes: true
  }))

  // Emitted when the window is closed.
  splashWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    splashWindow = null
  })
}

function createEditor() {
  editorWindow = new BrowserWindow({width: 1280, height:720, frame: false})
  editorWindow.loadURL(url.format({
    pathname: path.join(__dirname, "pages", "editor-main" , "editor-main.html"),
    protocol: 'file:',
    slashes: true
  }))

  editorWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  editorWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    editorWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createSplash)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  createSplash()
})

ipcMain.on('splash-timeout', function() {
    createEditor()
    splashWindow.close()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
