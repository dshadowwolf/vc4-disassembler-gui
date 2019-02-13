const arch = {
    instructions: [],
    tables: {},
    signed: {}
}

function archDefineTable(def){
    // def: T [ "i0", "i1", ..., "in" ]
    let ndef = def.slice(0,-1);
    log.info('Table definition '+ndef);
    // Table name is the first char
    var symbol = ndef[0];
    // Get array of quoted string elements
    var quoted_items = ndef.match(/"[^"]*"/g);
    // Strip the quotes off each entry
    var table = quoted_items.map(function(x){return x.substring(1,x.length-1)});
    arch.tables[symbol] = table;
    log.info('Table definition '+symbol+' is '+table.toString());
}

function archLookupTable(arch, symbol, index) {
    return arch.tables[symbol][index];
}

function archDefineSigned(def){
    let ndef = def.slice(0,-1);
    log.info('Signed definition '+ndef);
    arch.signed[ndef[0]] = true;
}

function archAddinst(pattern, action){
    log.info('Added instruction '+pattern+' => '+action);
    arch.instructions.push({pattern: pattern, action: action});
}

function archFindinst(arch, ws) {
    for (let i=0; i<arch.instructions.length; i++) {
        let inst = arch.instructions[i];
        if (instMatch(inst, ws[inst.bytelength/2-1]))
            return inst;
    }
}

function processArch(arch){
    let lines = arch.split('\n');
    for (let i=0; i<lines.length; i++) {
        let pattern = '';
        for (let j=0; j<lines[i].length; j++) {
            let c = lines[i][j];
            if (c==' ' || c=='\t') {
		continue;
            }
            else if (c=='#' || c=='\n' || c=='\r') {
		break;
            }
            else if (lines[i].indexOf('(define-table', j)==j) {
		archDefineTable(lines[i].substring(j+14));
		break;
            }
            else if (lines[i].indexOf('(define-signed', j)==j) {
		archDefineSigned(lines[i].substring(j+15));
		break;
            }
            else if (lines[i].indexOf('(set-byte-order', j)==j) {
		//todo: implement custom byte orders
		break;
            }
            else if (c=='"') {
		// Scan closing quote
		let end = lines[i].indexOf('"', j+1);
		if (end<0) {
		    log('Missing closing " on line '+(i+1)+'.');
		    break;
		}
		archAddinst(pattern, lines[i].substring(j+1, end));
		break;
            }
            else {
		let k=j;
		for (; ;) {
		    c = lines[i][j];
		    if (c==' ' || c=='\t') {
			j++;
		    }
		    else if ((c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z') || c=='0' || c=='1' || c=='!' || c=='?') {
			pattern = pattern + c;
			j++;
		    }
		    else if (c == ':') {
			j++;
			let num = 0;
			while (lines[i][j] >= '0' && lines[i][j] <= '9') {
			    num = (num * 10) + (lines[i][j] - '0');
			    j++;
			}
			c = pattern[pattern.length - 1];
			while (num-- > 1) {
			    pattern = pattern + c;
			}
		    }
		    else {
			break;
		    }
		}
		//log('pattern is '+pattern+' '+k+'..'+j);
		j--;
            }
        }
    }
}
