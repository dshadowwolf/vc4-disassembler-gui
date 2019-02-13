function instPrepare(inst) {
    inst.bitlength = 0;
    inst.masks=[]; inst.bits=[];
    let bit = 8, bitvalue = 0, maskvalue = 0;
    for(let i=0; i<inst.pattern.length; i++){
        let c = inst.pattern[i];
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
    for(let i=0; i<inst.bytelength; i++)  {
        if ((bytes[i] & inst.masks[i]) != inst.bits[i])
            return 0;
    }
    return 1;
}

//tmp hack
function is_signed(c) { return c=='i' || c=='o'; }

function instBind(inst, bytes) {
    let bindings = {values:{}, lengths:{}};
    let j=0, bit = 0, byte;
    for (let i=0; i<inst.pattern.length; i++) {
        let c=inst.pattern[i];
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

function ws(e, i) {
    return [
        [u8(e, i+1), u8(e, i+0)],
        [u8(e, i+1), u8(e, i+0), u8(e, i+3), u8(e, i+2)],
        [u8(e, i+1), u8(e, i+0), u8(e, i+5), u8(e, i+4), u8(e, i+3), u8(e, i+2)],
        [u8(e, i+1), u8(e, i+0), u8(e, i+3), u8(e, i+2), u8(e, i+5), u8(e, i+4), u8(e, i+7), u8(e, i+6)],
        [u8(e, i+1), u8(e, i+0), u8(e, i+3), u8(e, i+2), u8(e, i+5), u8(e, i+4), u8(e, i+7), u8(e, i+6), u8(e, i+9), u8(e, i+8)],
    ];
}

