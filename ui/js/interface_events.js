const electron = require('electron');

electron.ipcRenderer.on('logInfo', (event, message) => {
    log.info(message);
});

electron.ipcRenderer.on('openFile', (event, message) => {
    log.debug("opening file: \'"+message+"\'");
    let data = loadFileRaw(message);

    let first = true;
    for(let j = 0; j < data.length; j += 32) {
	let addr = "0x"+(0x80000000 + j).toString(16).toUpperCase();
	let hexData = "";
	let its = "";
	for(let k = 0; k < 32 && (j+k) < data.length; k++) {
	    if( (k%4) == 0 ) hexData += " ";
	    hexData += data.readUInt8(j+k).toString(16).padStart(2,'0');
	    let hd = data.readUInt8(j+k);
	    its += (hd>32 && hd <127)?String.fromCharCode(hd):(hd==32)?"&nbsp;":".";
	}
	let line = addr + ": <span class=\"mem-line\">" + hexData + "</span><span class=\"chars\">" + its + "</span>";
	if(first) {
	    $("#memory-view").html(line+"<br>");
	    first = false;
	} else {
	    $("#memory-view").append(line+"<br>");
	}
    }

    log.info("disassembling instruction stream now...");
    let disassembled = dis(data);
    log.info("Disassembly has "+disassembled.length+" items");
    first = true;
    disassembled.forEach((element) => {
	if(first) {
	    $("#instruction-view").html(element+"<br>");
	    first = false;
	} else {
	    $("#instruction-view").append(element+"<br>");
	}
    });

    log.info("File Loaded!");
});
