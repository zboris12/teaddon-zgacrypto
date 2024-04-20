if(!Function.prototype.inherit){
	/**
	 * @param {Function} ptcls parent class
	 * @export
	 */
	Function.prototype.inherit = function(ptcls){
		this.super_ = ptcls;
		if(typeof Object.create === "function"){
			this.prototype = Object.create(ptcls.prototype, {
				constructor: {
					value: this,
					enumerable: false,
					writable: true,
					configurable: true
				}
			});
		}else{
			// old school shim for old browsers
			/** @constructor */
			var tempCtr = function(){};
			tempCtr.prototype = ptcls.prototype;
			this.prototype = new tempCtr();
			this.prototype.constructor = this;
		}

		if(!this.prototype.getSuperClass){
			/**
			 * @return {*}
			 * @export
			 */
			this.prototype.getSuperClass = function(){
				return this.constructor.super_;
			};
		}
		if(!this.prototype.super){
			/**
			 * @param {...*} vars
			 * @export
			 */
			this.prototype.super = function(vars){
				/** @type {Array} */
				var args = Array.from(arguments);
				return this.constructor.super_.apply(this, args);
			};
		}
		if(!this.prototype.superCall){
			/**
			 * @param {string} funcnm
			 * @param {...*} vars
			 * @export
			 */
			this.prototype.superCall = function(funcnm, vars){
				/** @type {Array} */
				var args = Array.from(arguments);
				args.shift();
				if(funcnm){
					return this.constructor.super_.prototype[funcnm].apply(this, args);
				}else{
					return this.constructor.super_.apply(this, args);
				}
			};
		}
	};
}
if(!Array.from){
	/**
	 * @param {IArrayLike<T>|Iterable<T>} itr
	 * @return {Array<R>}
	 * @export
	 * @suppress {checkTypes}
	 */
	Array.from = function(itr){
		/** @type {Array} */
		var arr = new Array();
		/** @type {number} */
		var i = 0;
		while(i < itr.length){
			arr.push(itr[i]);
			i++;
		}
		return arr;
	};
}
if(!Uint8Array.prototype.slice){
	/**
	 * @public
	 * @param {number} st
	 * @param {number=} ed
	 * @return {Uint8Array}
	 * @export
	 * @suppress {checkTypes}
	 */
	Uint8Array.prototype.slice = function(st, ed){
		if(st >= ed){
			return new Uint8Array();
		}
		/** @type {Uint8Array} */
		var u8arr = this;
		/** @type {number} */
		var ed2 = Math.min(ed || u8arr.length, u8arr.length);
		if(st >= ed2){
			return new Uint8Array();
		}
		/** @type {Uint8Array} */
		var newU8 = new Uint8Array(ed2 - st);
		/** @type {number} */
		var i = 0;
		while(i < newU8.length){
			newU8[i] = u8arr[i + st];
			i++;
		}
		return newU8;
	};
}
if(!Uint8Array.prototype.push){
	/**
	 * @public
	 * @param {number} num
	 * @return {Uint8Array}
	 * @export
	 */
	Uint8Array.prototype.push = function(num){
		/** @type {Uint8Array} */
		var u8arr = this;
		/** @type {Uint8Array} */
		var newU8 = new Uint8Array(u8arr.length + 1);
		newU8.set(u8arr, 0);
		newU8[u8arr.length] = num;
		return newU8;
	};
}
if(!Uint8Array.prototype.toRaw){
	/**
	 * @public
	 * @return {string}
	 * @export
	 */
	Uint8Array.prototype.toRaw = function(){
		/** @type {Uint8Array} */
		var uarr = this;
		/** @type {string} */
		var ret = "";
		/** @type {number} */
		var i = 0;
		while(i < uarr.length){
			ret += String.fromCharCode(uarr[i]);
			i++;
		}
		return ret;
	};
}
if(!Uint8Array.prototype.toBstr){
	/**
	 * @public
	 * @return {string} //BSTR
	 * @export
	 */
	Uint8Array.prototype.toBstr = function(){
		/** @type {Uint8Array} */
		var uarr = this;
		if(uarr.length < 2){
			return "";
		}
		if(uarr.length % 2){
			uarr = uarr.slice(0, uarr.length - 1);
		}
		/** @type {Uint16Array} */
		var u16 = new Uint16Array(uarr.buffer);
		/** @type {string} */
		var ret = "";
		/** @type {number} */
		var i = 0;
		while(i < u16.length){
			ret += String.fromCharCode(u16[i]);
			i++;
		}
		return ret;
	};
}
if(!Uint8Array.fromRaw){
	/**
	 * @param {string} raw
	 * @return {!Uint8Array}
	 * @export
	 */
	Uint8Array.fromRaw = function(raw){
		/** @type {!Uint8Array} */
		var arr = new Uint8Array(raw.length);
		/** @type {number} */
		var i = 0;
		while(i < raw.length){
			arr[i] = raw.charCodeAt(i);
			i++;
		}
		return arr;
	};
}
if(!Uint8Array.fromBstr){
	/**
	 * @param {string} bstr //BSTR
	 * @return {!Uint8Array}
	 * @export
	 */
	Uint8Array.fromBstr = function(bstr){
		/** @type {Uint16Array} */
		var u16 = new Uint16Array(bstr.length);
		/** @type {number} */
		var i = 0;
		while(i < u16.length){
			u16[i] = bstr.charCodeAt(i);
			i++;
		}
		return new Uint8Array(u16.buffer);
	};
}

/**
 * @typedef
 * {{
 *    _code: (number|undefined),
 *    _out: (string|undefined),
 *    _err: (string|undefined),
 * }}
 */
var ExecReturn;

const ZgaCrypto = {};
/** @type {string} */
ZgaCrypto.SRCDIR = "";
/** @type {AddonElement} */
ZgaCrypto.addon = null;
/**
 * @param {string} nm
 * @param {string=} dft
 * @return {string}
 */
ZgaCrypto.getAttribute = function(nm, dft){
	if(ZgaCrypto.addon && ZgaCrypto.addon.getAttribute(nm)){
		return ZgaCrypto.addon.getAttribute(nm);
	}else if(dft){
		return dft;
	}else{
		return "";
	}
};

/**
 * @param {string} cmd
 * @return {?ExecReturn}
 */
ZgaCrypto.exec = function(cmd){
	/** @type {WshScriptExec} */
	var exe = wsh.Exec(cmd);
	/** @type {number} */
	var hPrs = api.OpenProcess(SYNCHRONIZE, false, exe.ProcessID);
	/** @type {Array<string>} */
	var arrOut = [];
	/** @type {Array<string>} */
	var arrErr = [];
	/** @type {ExecReturn} */
	var ret = {};
	if(hPrs == 0){
		return null;
	}
	while(api.WaitForSingleObject(hPrs, 100) == WAIT_TIMEOUT){
		if(!exe.StdOut.AtEndOfStream){
			arrOut.push(exe.StdOut.ReadAll());
		}
		if(!exe.StdErr.AtEndOfStream){
			arrErr.push(exe.StdErr.ReadAll());
		}
	}
	while(!exe.StdOut.AtEndOfStream){
		arrOut.push(exe.StdOut.ReadAll());
	}
	while(!exe.StdErr.AtEndOfStream){
		arrErr.push(exe.StdErr.ReadAll());
	}
	api.CloseHandle(hPrs);
	ret.code = exe.ExitCode;
	ret.out = arrOut.join("");
	ret.err = arrErr.join("");
	return ret;
};

/**
 * @param {string} cmd
 * @return {?ExecReturn}
 */
ZgaCrypto.execPshCommand = function(cmd){
		/** @type {string} */
		var pcmd = '"%SystemRoot%\\system32\\WindowsPowerShell\\v1.0\\powershell.exe" -WindowStyle Hidden -NonInteractive -NoLogo -Command ' + cmd;
		return ZgaCrypto.exec(pcmd);
};
