class Logger {
    constructor() {
    }

    info(text) {	
	this.logInner("INFO", text);
    }

    debug(text) {
	this.logInner("DEBUG", text);
    }

    warn(text) {
	this.logInner("WARNING", text);
    }

    error(text) {
	this.logInner("ERROR", text);
    }

    fatal(text) {
	this.logInner("FATAL", text.toUpperCase());
    }

    logInner(prefix, text) {
	let ntext = "<br><span class=\"";
	ntext += prefix.toLowerCase();
	ntext += "\">";
	ntext += prefix;
	ntext += " : ";
	ntext += text;
	ntext += "</span>";
	$(this._sel).append(ntext);
    }

    setSelector(selector) {
	this._sel = selector;
    }
}

window.log = new Logger();

