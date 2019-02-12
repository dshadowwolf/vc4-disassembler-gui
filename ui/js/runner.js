$(document).ready(function() {
    let k = [];
    for(let i=0; i <= 4096; i += 32) {
	let h = "0x";
	let b = i.toString(16);
	h += b.padStart(8,'0');
	h += ": 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000";
	k.push(h);
    }
    let fin = k.join("<br>");
    $("#memory-view").html(fin);
    $("#memory-view").css("height", $("#register-view").height());
    $("#stack-view").css("height", $("#register-view").height());
    $("#memory-view").css("width", ($("body").outerWidth() - $("#register-view").width() - $("#stack-view").width() - 20).toString()+"px");
    let n = [];
    for(let j = 0; j <= 256; j += 4)
	n.push("0x" + j.toString(16).padStart(8,'0') + ": 0x00000000");

    $("#stack-view").html(n.join("<br>"));
});

$(window).resize(function() {
    $("#memory-view").css("height", $("#register-view").height());
    $("#stack-view").css("height", $("#register-view").height());
    $("#memory-view").css("width", ($("body").outerWidth() - $("#register-view").width() - $("#stack-view").width() - 20).toString()+"px");
    console.log("current mem-view: "+$("#memory-view").width()+"x"+$("#memory-view").height());
});
