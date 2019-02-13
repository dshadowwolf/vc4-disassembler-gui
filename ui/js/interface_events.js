const electron = require('electron');

electron.ipcRenderer.on('logInfo', (event, message) => {
    log.info(message);
});

electron.ipcRenderer.on('openFile', (event, message) => {
    log.debug("opening file: \'"+message+"\'");
    log.debug(loadFile(message));
});
