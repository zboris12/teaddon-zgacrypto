/**
 * @constructor
 */
ZgaCrypto.ProgessBar = function(){
	/** @private @const {string} */
	this.htmpath = fso.BuildPath(ZgaCrypto.SRCDIR, "progressbar.html");
	/**
	 * interval time (milliseconds)
	 * @private
	 * @const {number}
	 */
	this.interms = 10;
	/** @private @type {Window} */
	this.wnd = null;
	/**
	 * @private
	 * @type {number}
	 *
	 * 0:Not ready, 1:In loop, 8: Done, 9:Close, -9:cancelled
	 */
	this.step = 0;
	/** @private @type {boolean} */
	this.executing = false;
	/** @private @type {number} */
	this.hdSize = 0;
	/** @private @type {number} */
	this.size = 0;
	/** @private @type {number} */
	this.hdloop = 0;
	/** @private @type {Date} */
	this.stdt = null;
	/** @private @type {number} */
	this.oldels = 0;
	/** @private @type {string} */
	this.oldelstr = "";
	/** @private @type {Function|undefined} */
	this.initFunc = null;
	/** @private @type {Function|undefined} */
	this.loopFunc = null;
};

/**
 * @public
 * @param {Function=} initFunc
 * @param {Function=} loopFunc
 * @param {number=} hdSize
 */
ZgaCrypto.ProgessBar.prototype.open = function(initFunc, loopFunc, hdSize){
	this.initFunc = initFunc;
	this.loopFunc = loopFunc;
	this.hdSize = hdSize || 0;
	/** @type {TablacusControl} */
	var c = ShowDialog(this.htmpath, { MainWindow: MainWindow, Modal: true, width: 500, height: 200});
	this.wnd = c.Window;
	this.hdloop = setInterval(this.loop.bind(this), this.interms);
};
/**
 * @public
 * @return {boolean}
 */
ZgaCrypto.ProgessBar.prototype.isReady = function(){
	return (this.step > 0);
};
/**
 * @public
 * @param {number} sz
 */
ZgaCrypto.ProgessBar.prototype.setSize = function(sz){
	this.size = sz;
};
/**
 * @public
 * @param {number} pos
 * @param {string=} msg
 */
ZgaCrypto.ProgessBar.prototype.setHdPosition = function(pos, msg){
	try{
		if(!this.isReady()){
			return;
		}
		if(msg){
			this.wnd.document.getElementById("tdHeader").innerHTML = msg;
		}

		if(!this.hdSize){
			return;
		}
		if(pos > this.hdSize){
			pos = this.hdSize;
		}
		this.wnd.document.getElementById("tdHdCnt").innerHTML = pos + "/" + this.hdSize;
		this.wnd.document.getElementById("divHdPrgs").style.width = Math.floor(this.wnd.document.getElementById("tdprgs").clientWidth * pos / this.hdSize) + "px";
	}catch(ex){
		this.step = -9;
	}
};
/**
 * @public
 * @param {number} pos
 * @param {string=} msg
 */
ZgaCrypto.ProgessBar.prototype.setPosition = function(pos, msg){
	try{
		if(!this.isReady()){
			return;
		}
		this.wnd.document.getElementById("tdMain").innerHTML = this.getElapsedTime() + " " + (msg || "");

		if(!this.size){
			return;
		}
		if(pos > this.size){
			pos = this.size;
		}
		this.wnd.document.getElementById("tdCount").innerHTML = Math.floor(100 * pos / this.size) + "%";
		this.wnd.document.getElementById("divPrgs").style.width = Math.floor(this.wnd.document.getElementById("tdprgs").clientWidth * pos / this.size) + "px";
		if(this.wnd.document.getElementById("Result").value == "1"){
			this.step = -9;
		}
	}catch(ex){
		this.step = -9;
	}
};
/**
 * @public
 * @return {boolean}
 */
ZgaCrypto.ProgessBar.prototype.isCancelled = function(){
	return (this.step == -9);
};
/**
 * @public
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
 * @public
 */
ZgaCrypto.ProgessBar.prototype.close = function(){
	this.step = 9;
};
/**
 * @public
 */
ZgaCrypto.ProgessBar.prototype.done = function(){
	this.step = 8;
	this.wnd.document.getElementById("btnCancel").value = "Close";
};

/**
 * @private
 */
ZgaCrypto.ProgessBar.prototype.loop = function(){
	try{
		if(this.executing){
			return;
		}
		this.executing = true;
		switch(this.step){
		case 0:
			if(this.wnd.document.readyState == "complete"){
				this.step = 1;
				if(this.hdSize > 1){
					this.wnd.document.getElementById("trHeader").style.display = "";
					this.wnd.document.getElementById("trHdPrgs").style.display = "";
				}
				this.wnd.document.getElementById("trMain").style.display = "";
				this.wnd.document.getElementById("trPrgs").style.display = "";
				this.stdt = new Date();
				if(this.initFunc){
					this.initFunc();
				}
			}
			break;
		case 1:
			if(this.loopFunc){
				this.loopFunc();
			}
			break;
		case 8:
			if(this.wnd.document.getElementById("Result").value == "1"){
				this.step = 9;
			}
			break;
		case 9:
		case -9:
			clearInterval(this.hdloop);
			this.hdloop = 0;
			this.wnd.close();
			break;
		}
		this.executing = false;
	}catch(ex){
		clearInterval(this.hdloop);
		this.hdloop = 0;
		this.step = -9;
	}
};
