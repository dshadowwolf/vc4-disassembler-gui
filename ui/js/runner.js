$(document).ready(function() {
    log.setSelector("#log-window div#log");
    $("div#log").append("VC4 Tracing Disassembler v1.0.0-alpha1<br>Copyright &copy;2019 Daniel \"DShadowWolf\" Hazelton and others<br>Using Node.JS and Electron<br>Starting up now...<br>");
    let k = [];
    for(let i=0; i <= 4096; i += 32) {
	let h = "0x";
	let b = i.toString(16);
	h += b.padStart(8,'0');
	h += ": <span class=\"mem-line\">00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000</span>  <span class=\"chars\">................................</span>";
	k.push(h);
    }
    let fin = k.join("<br>");
    $("#memory-view").html(fin);
    let p = [];
    for(let x = 0; x < 4096; x += 2)
	p.push("0x"+x.toString(16).padStart(8,'0')+": bkpt");
    $("#instruction-view").html(p.join("<br>"));
    
    let n = [];
    for(let j = 0; j <= 256; j += 4)
	n.push("0x" + j.toString(16).padStart(8,'0') + ": 0x00000000");

    $("#stack-view").html(n.join("<br>"));
    loadArchitecture(loadFile("ui/videocoreiv.arch"));
});

