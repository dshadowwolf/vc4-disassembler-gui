var z32 = "00000000000000000000000000000000";
function as(i, base, width) {
    var r = i.toString(base);
    return z32.substring(32-width+r.length)+r;
}

function u8(a, i) {
    if(i >= a.length) return 0;
    return a.readUInt8(i);
}

function u16(a, i) {
    return u8(a, i)|(u8(a, i+1)<<8);
}
function u32(a, i) {
    return (u16(a, i)|(u16(a, i+2) << 16))>>>0;
}

const arch = {
    instructions: [],
    tables: {},
    signed: {}
}

function archDefineTable(def){
    // def: T [ "i0", "i1", ..., "in" ]
    def = def.slice(0,-1);
    log.info('Table definition '+def);
    // Table name is the first char
    var symbol = def[0];
    // Get array of quoted string elements
    var quoted_items = def.match(/"[^"]*"/g);
    // Strip the quotes off each entry
    var table = quoted_items.map(function(x){return x.substring(1,x.length-1)});
    arch.tables[symbol] = table;
    log.info('Table definition '+symbol+' is '+table.toString());
}
function archLookupTable(arch, symbol, index) {
    return arch.tables[symbol][index];
}
function archDefineSigned(def){
    def = def.slice(0,-1);
    log.info('Signed definition '+def);
    arch.signed[def[0]] = true;
}
function archAddinst(pattern, action){
    log.info('Added instruction '+pattern+' => '+action);
    arch.instructions.push({pattern: pattern, action: action});
}

function instPrepare(inst) {
    inst.bitlength = 0;
    inst.masks=[]; inst.bits=[];
    var bit = 8, bitvalue = 0, maskvalue = 0;
    for(var i=0; i<inst.pattern.length; i++){
        var c = inst.pattern[i];
        if(c!=' ' && c!='\t') {
            inst.bitlength++;
            bitvalue = (bitvalue << 1) | (c=='1');
            maskvalue = (maskvalue <<1) | (c=='0'||c=='1');
            if (--bit == 0) {
		inst.bits.push(bitvalue); inst.masks.push(maskvalue);
		bitvalue = maskvalue = 0; bit = 8;
            }
        } 
    }
    if (bit < 8) {
        inst.bits.push(bitvalue << bit); inst.masks.push(maskvalue << bit);
    }
    inst.bytelength = (inst.bitlength+7)>>3;
    return inst.bitlength;
}

function instMatch(inst, bytes) {
    for(var i=0; i<inst.bytelength; i++)  {
        if ((bytes[i] & inst.masks[i]) != inst.bits[i])
            return 0;
    }
    return 1;
}

//tmp hack
function is_signed(c) { return c=='i' || c=='o'; }

function instBind(inst, bytes) {
    var bindings = {values:{}, lengths:{}};
    var j=0, bit = 0, byte;
    for (var i=0; i<inst.pattern.length; i++) {
        var c=inst.pattern[i];
        if (c!=' ' && c!='\t'){
            bindings.values[c] = bindings.values[c] || 0;
            bindings.lengths[c] = bindings.lengths[c] || 0;
            byte = bit==0 ? bytes[j++] : byte;
            if(bindings.lengths[c]==0 && is_signed(c) && (byte>>7))
		bindings.values[c] = -1;
            bindings.values[c] = (bindings.values[c]<<1) | (byte>>7);
            bindings.lengths[c]++;
            byte = (byte << 1)&0xff; 
            bit = (bit+1) & 7;
        }
    }
    return bindings;
}

function is_printf_flag(c)      { return (c=='+') || (c==' ') || (c=='#') || (c=='0'); }                                                     
function is_printf_digit(c)     { return (c>='0') && (c<='9'); }
function is_printf_precision(c) { return (c=='.'); }       
function is_printf_length(c)    { return (c=='h') || (c=='l') || (c=='L') || (c=='z') || (c=='j') || (c=='t'); }

function instShow(inst, bindings, pc) {

    var i;
    var get_number = function() {
        var n =0;
        for (; is_printf_digit(inst.action[i]); i++)
            n = n * 10 + inst.action.charCodeAt(i)-"0".charCodeAt(0);
        return n;
    } 

    var o=[];
    var flags, width, precision, length, type;
    for (var i=0; i<inst.action.length; i++) {
        var c = inst.action[i];
        if (c=='%') { //%[parameter][flags][width][.precision][length]type
            flags = width = precision = length = type = null;
            i++;
            flags = is_printf_flag(inst.action[i]) ? inst.action[i++] : 0;
            if (is_printf_digit(inst.action[i]))
		width = get_number();
            if (is_printf_precision(inst.action[i])) {
		i++;
		precision = get_number();
            }
            length = is_printf_length(inst.action[i]) ? inst.action[i++] : 0;
            type = inst.action[i];
        }
        else if (c=='{') {
            // evaluate expression up to }
            // and then print according to fmt
            var fmt="";
            for (var j=++i;inst.action[i]!='}'; i++);
	    
            fmt=inst.action.substring(j, i);
            with(bindings.values) {
		fmt=eval(fmt);
            }
            if (type=='x')
		fmt=fmt>>>0;
            o.push(fmt.toString(type=='x'?16:10));
        }
        else {
            o.push(c);
        }
    }
    return o.join('');
}

function archFindinst(arch, ws) {
    for (var i=0; i<arch.instructions.length; i++) {
        var inst = arch.instructions[i];
        if (instMatch(inst, ws[inst.bytelength/2-1])) {
            return inst;
	}
    }
}

function ws(e, i) {
    return [
        [u8(e, i+1), u8(e, i+0)],
        [u8(e, i+1), u8(e, i+0), u8(e, i+3), u8(e, i+2)],
        [u8(e, i+1), u8(e, i+0), u8(e, i+5), u8(e, i+4), u8(e, i+3), u8(e, i+2)],
        [u8(e, i+1), u8(e, i+0), u8(e, i+3), u8(e, i+2), u8(e, i+5), u8(e, i+4), u8(e, i+7), u8(e, i+6)],
        [u8(e, i+1), u8(e, i+0), u8(e, i+3), u8(e, i+2), u8(e, i+5), u8(e, i+4), u8(e, i+7), u8(e, i+6), u8(e, i+9), u8(e, i+8)],
    ];
}

function processArch(arch){
    var lines = arch.split('\n');
    for (var i=0; i<lines.length; i++) {
        var pattern = '';
        for (var j=0; j<lines[i].length; j++) {
            var c = lines[i][j];
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
		var end = lines[i].indexOf('"', j+1);
		if (end<0) {
		    log.info('Missing closing " on line '+(i+1)+'.');
		    break;
		}
		archAddinst(pattern, lines[i].substring(j+1, end));
		break;
            }
            else {
		var k=j;
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
			var num = 0;
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
		j--;
            }
        }
    }
}

function dc(c) {
    return (c>=32 && c<=126) ? String.fromCharCode(c) : '.';
}

function dis2(arch, e, i, d){
    var l=[];
    l.push("0x"+as(0x80000000+i, 16, 8)+": ");

    var bytes = ws(e, i);
    var inst = archFindinst(arch, bytes);
    if (inst) {
        var bindings = instBind(inst, bytes[inst.bytelength/2-1]);
        for (var j=32; j<128; j++) {
            var c = String.fromCharCode(j);
            if (bindings.lengths[c]>0 && arch.tables[c]) {
		bindings.values[c] = archLookupTable(arch, c, bindings.values[c]);
            }
            bindings.values['$'] = i;
        }
        l.push(instShow(inst, bindings, i));
    }

    d.push(l.join(''));
    if (inst) {
        return inst.bytelength;
    }
    return 2;
}

function dis(memory){
    var d = [];
    for (var a=0; a<memory.length; ){
        a+=dis2(arch, memory, a, d);
    } 
    return d;
}

function loadArchitecture(jsonp) {
    log.info('Architecture loaded');
    // var architecture = window.atob(jsonp.data.content.replace(/\s/g,''));
    // var e = architecture;
    // log.info('Architecture file loaded.\n');
    processArch(jsonp);
    
    for(var i=0; i<arch.instructions.length; i++){
        var inst = arch.instructions[i];
        if ((instPrepare(inst) & 7) != 0) {
            log.info('Warning: instruction found that is not an exact multiple of bytes.');
        }
    }
}
