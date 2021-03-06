const { app, BrowserWindow, shell, Menu, dialog } = require('electron')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

const menu_template = [
    {
	label: 'File',
	submenu: [
	    { label: "Load",
	      accelerator: 'CmdOrCtrl+L',
	      click(item, focusedWindow) {
		  let files = dialog.showOpenDialogSync({
		      properties: ['openFile'],
		      filters: [ {
			  name: 'All Files',
			  extensions: ['*']
		      }, {
			  name: 'Firmware Files',
			  extensions: ['elf', 'bin' ]
		      }
			       ]
		  });
		  if(files) {
	              console.log(require("util").inspect(files));
		      focusedWindow.send('openFile', files[0]);
		  } else {
		      focusedWindow.send('logInfo', "no file selected");
		  }
	      }
	    },
	    { role: 'close' }
	]
    }
];

function createWindow () {
    // Create the browser window.
    win = new BrowserWindow({
	width: 1573,
	height: 1017,
	resizable: false,
	webPreferences: {
	    nodeIntegration: true,
	    devTools: false
	},
	allowEval: true
    });


    const menu = Menu.buildFromTemplate(menu_template);
    Menu.setApplicationMenu(menu);
    
    // and load the index.html of the app.
    win.loadFile('ui/main.html')

    // Open the DevTools.
    win.webContents.openDevTools()

    // Emitted when the window is closed.
    win.on('closed', () => {
	// Dereference the window object, usually you would store windows
	// in an array if your app supports multi windows, this is the time
	// when you should delete the corresponding element.
	win = null
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
	app.quit()
    }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
	createWindow()
    }
})

app.on('web-contents-created', (event, contents) => {
    contents.on('will-navigate', (event, navigationUrl) => {
	const parsedUrl = new URL(navigationUrl)

	if (parsedUrl.origin !== 'https://my-own-server.com') {
	    event.preventDefault()
	}
    })
})

app.on('web-contents-created', (event, contents) => {
    contents.on('new-window', (event, navigationUrl) => {
	// In this example, we'll ask the operating system
	// to open this event's url in the default browser.
	event.preventDefault()

	shell.openExternalSync(navigationUrl)
    })
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
