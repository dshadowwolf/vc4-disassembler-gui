const electron = require('electron');

electron.ipcRenderer.on('logInfo', (event, message) => {
    log.info(message);
});

electron.ipcRenderer.on('openFile', (event, message) => {
    log.debug("opening file: \'"+message+"\'");
    let data = loadFileRaw(message);
    log.info("Loaded "+message+" => "+data.length+" bytes of data -- type: "+data); 

    let getDisplayChar = function(c) {
	return (c>=32 && c<=126) ? String.fromCharCode(c) : '.';
    };
	
    let getDisplayString = function(i) {
	let rv = "";
	i.forEach((elem) => rv += getDisplayChar(elem));
	return rv;
    };

    let first = true;
    for(let j = 0; j < data.length; j += 32) {
	let addr = "0x"+(0x80000000 + j).toString(16).toUpperCase();
	let hexData = "";
	let its = [];
	for(let k = 0; k < 32 && (j+k) < data.length; k++) {
	    if( (k%4) == 0 ) hexData += " ";
	    hexData += data.readUInt8(j+k).toString(16).padStart(2,'0');
	    its.push(data.readUInt8(j+k));
	}
	let line = addr + ": <span class=\"mem-line\">" + hexData + "</span>  <span class=\"chars\">" + getDisplayString(its) + "</span>";
	log.debug("line:: \""+line+"\"");
	if(first) {
	    $("#memory-view").html(line+"<br>");
	    first = false;
	} else {
	    $("#memory-view").append(line+"<br>");
	}
    }
	
/*    let disassembled = dis(data);
    log.info("Disassembly has "+disassembled.length+" items");
    disassembled.forEach((element) => {
	$("#instruction-view").append(element);
	$("#instruction-view").append("<br>");
    });
*/
});
