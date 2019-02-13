function loadFile(fileName) {
    return require('fs').readFileSync(fileName, 'utf8');
}

function loadJSON(fileName) {
    return JSON.parse(loadFile(fileName));
}

function loadFileRaw(fileName) {
    return require('fs').readFileSync(fileName);
}

function loadBinary(jsonp) {
    let reader = new FileReader();
    let contents = false;
    reader.onload = function(event) {
	contents = this.result;
    }

    reader.readAsBinaryString(file);
    while(contents == false) ;
    return contents;
}
