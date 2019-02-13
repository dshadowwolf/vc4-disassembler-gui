function loadFile(fileName) {
    let fs = require('fs');

    return fs.readFileSync(fileName, 'utf8');
}

function loadJSON(fileName) {
    return JSON.parse(loadFile(fileName));
}

