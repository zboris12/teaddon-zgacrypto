if(!Uint8Array.prototype.slice){
	/**
	 * @public
	 * @param {number} st
	 * @param {number=} ed
	 * @return {Uint8Array}
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
if(!Uint8Array.fromRaw){
	/**
	 * @param {string} raw
	 * @return {!Uint8Array}
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
