/** @type {?} */
Addons.ZgaCrypto;
/** @interface */
function IBinFile(){
	/**
	 * @protected
	 * @param {boolean=} forwrite
	 */
	this.open = function(forwrite){};
	/**
	 * @public
	 */
	this.close = function(){};
}
/**
 * @interface
 * @extends {IBinFile}
 */
function IBinReader(){
	/**
	 * @public
	 * @return {boolean}
	 */
	this.isEnd = function(){};
	/**
	 * @public
	 * @return {Uint8Array}
	 */
	this.readAll = function(){};
	/**
	 * @public
	 * @param {number=} size
	 * @return {Uint8Array}
	 */
	this.read = function(size){};
}
/**
 * @interface
 * @extends {IBinFile}
 */
function IBinWriter(){
	/**
	 * @public
	 * @param {Uint8Array} dat
	 */
	this.write = function(dat){};
}
/**
 * @interface
 */
function IProgessBar(){
	/**
	 * @public
	 * @param {number=} hdSize
	 * @param {boolean=} showResult
	 */
	this.open = function(hdSize, showResult){};
	/**
	 * @protected
	 * @return {boolean} process end or not
	 */
	this.hdStepForward = function(){};
	/**
	 * @protected
	 * @param {number} offset
	 * @param {string=} msg
	 * @return {boolean} is it ok to continue?
	 */
	this.stepForward = function(offset, msg){};
	/**
	 * @protected
	 * @param {string} msg
	 */
	this.appendResult = function(msg){};
	/**
	 * @protected
	 * @return {string} header message
	 */
	this.prepareHdStep = function(){};
	/**
	 * @protected
	 */
	this.step = function(){};
	/**
	 * @protected
	 */
	this.dispose = function(){};
}
