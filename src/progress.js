/**
 * @abstract
 * @constructor
 */
ZgaCrypto.ProgessBar = function(){
	/** @protected @type {number} */
	this.hdStep = -1;
	/** @protected @type {number} */
	this.pos = 0;
	/** @protected @type {number} */
	this.size = 0;

	/** @private @const {string} */
	this.htmpath = fso.BuildPath(ZgaCrypto.SRCDIR, "progressbar.html");
	/** @private @type {Window} */
	this.wnd = null;
	/** @private @type {number} */
	this.hdSize = 0;
	/** @private @type {boolean} */
	this.executing = false;
	/** @private @type {number} */
	this.hdloop = 0;
	/** @private @type {Date} */
	this.stdt = null;
	/** @private @type {number} */
	this.oldels = 0;
	/** @private @type {string} */
	this.oldelstr = "";
	/** @private @type {boolean} */
	this.closed = false;
};

/**
 * @public
 * @param {number=} hdSize
 * @param {boolean=} showResult
 */
ZgaCrypto.ProgessBar.prototype.open = function(hdSize, showResult){
	this.hdSize = hdSize || 1;
	/** @type {ZgaCrypto.ProgessBar} */
	var _this = this;
	/** @type {TablacusControl} */
	var c = ShowDialog(_this.htmpath, {
		MainWindow: MainWindow,
		Modal: true,
		width: 500,
		height: (this.hdSize > 1 ? 190 : 130) + (showResult ? 190 : 0),
	});
	_this.wnd = c.Window;
	AddEventEx(_this.wnd, "load", function(_evt){
		var doc = /** @type {Document} */(_evt.target);
		AddEventEx(doc.getElementById("btnCancel"), "click", function(){
			_this.wnd.close();
		});
		if(_this.hdSize > 1){
			doc.getElementById("trHeader").style.display = "";
			doc.getElementById("trHdPrgs").style.display = "";
		}
		doc.getElementById("trMain").style.display = "";
		doc.getElementById("trPrgs").style.display = "";
		if(showResult){
			doc.getElementById("trResult").style.display = "";
			doc.getElementById("taResult").value = "";
		}
		_this.stdt = new Date();
		_this.hdloop = setInterval(_this.loop.bind(_this), 10);
	});
	AddEventEx(_this.wnd, "beforeunload", function(){
		_this.closed = true;
		_this.stopLoop();
		_this.dispose();
	});
};

/**
 * @protected
 * @return {boolean} process end or not
 */
ZgaCrypto.ProgessBar.prototype.hdStepForward = function(){
	if(this.closed){
		return true;
	}
	if(this.hdStep < this.hdSize){
		this.hdStep++;
	}

	if(this.hdSize > 1){
		this.wnd.document.getElementById("tdHdCnt").innerHTML = this.hdStep + "/" + this.hdSize;
		this.wnd.document.getElementById("divHdPrgs").style.width = Math.floor(this.wnd.document.getElementById("tdprgs").clientWidth * this.hdStep / this.hdSize) + "px";
	}
	if(this.hdStep < this.hdSize){
		/** @type {string} */
		var msg = this.prepareHdStep();
		this.wnd.document.getElementById("tdHeader").innerHTML = msg;
		return false;
	}else{
		this.stopLoop();
		this.wnd.document.getElementById("tdHeader").innerHTML = "Done";
		this.wnd.document.getElementById("btnCancel").value = "Close";
		return true;
	}
};
/**
 * @protected
 * @param {number} offset
 * @param {string=} msg
 * @return {boolean} is it ok to continue?
 */
ZgaCrypto.ProgessBar.prototype.stepForward = function(offset, msg){
	if(this.closed){
		return false;
	}
	this.wnd.document.getElementById("tdMain").innerHTML = this.getElapsedTime() + " " + (msg || "");

	if(!this.size){
		return true;
	}
	this.pos += offset;
	if(this.pos > this.size){
		this.pos = this.size;
	}
	this.wnd.document.getElementById("tdCount").innerHTML = Math.floor(100 * this.pos / this.size) + "%";
	this.wnd.document.getElementById("divPrgs").style.width = Math.floor(this.wnd.document.getElementById("tdprgs").clientWidth * this.pos / this.size) + "px";

	return true;
};
/**
 * @protected
 * @param {string} msg
 */
ZgaCrypto.ProgessBar.prototype.appendResult = function(msg){
	this.wnd.document.getElementById("taResult").value += msg + "\n";
};
/**
 * @abstract
 * @protected
 * @return {string} header message
 */
ZgaCrypto.ProgessBar.prototype.prepareHdStep = function(){};
/**
 * @abstract
 * @protected
 */
ZgaCrypto.ProgessBar.prototype.step = function(){};
/**
 * @abstract
 * @protected
 */
ZgaCrypto.ProgessBar.prototype.dispose = function(){};
/**
 * @private
 * @return {string}
 */
ZgaCrypto.ProgessBar.prototype.getElapsedTime = function(){
	/** @type {number} */
	var est = Math.round((new Date() - this.stdt) / 1000);
	if(est > this.oldels){
		this.oldels = est;
		/** @type {number} */
		var sec = est % 60;
		est = (est - sec) / 60;
		/** @type {number} */
		var mnt = est % 60;
		est = (est - mnt) / 60;
		if(est > 0){
			this.oldelstr = est + ":";
		}else{
			this.oldelstr = "";
		}
		this.oldelstr += "0".concat(mnt).slice(-2) + ":";
		this.oldelstr += "0".concat(sec).slice(-2);
	}
	return this.oldelstr;
};
/**
 * @private
 */
ZgaCrypto.ProgessBar.prototype.stopLoop = function(){
		if(this.hdloop){
			clearInterval(this.hdloop);
			this.hdloop = 0;
		}
};
/**
 * @private
 */
ZgaCrypto.ProgessBar.prototype.loop = function(){
	try{
		if(this.executing || this.closed){
			return;
		}
		this.executing = true;
		this.step();
		this.executing = false;
	}catch(ex){
		alert(ex.stack);
		this.wnd.close();
	}
};
