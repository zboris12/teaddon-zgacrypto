/**
 * System is little endian or big endian
 * @type {boolean}
 */
ZgaCrypto.isSysLe = (new Uint8Array(new Uint16Array([1]).buffer)[0] == 1);
/**
 * @constructor
 * @param {FolderItem} _fitm
 */
ZgaCrypto.BinReader = function(_fitm){
	/** @private @type {string} */
	this._path = _fitm.Path;
	/** @private @type {number} */
	this._size = _fitm.Size;

	/** @private @type {boolean} */
	this._le = ZgaCrypto.isSysLe;
	/** @private @type {TextStream} */
	this._strm = null;
	/** @private @type {boolean} */
	this._end = false;
	/** @private @type {number} */
	this._lastByte = -1;
	/** @private @type {Array<number>} */
	this._remain = null;
};
/**
 * @public
 */
ZgaCrypto.BinReader.prototype.close = function(){
	if(this._strm){
		this._strm.Close();
		this._strm = null;
	}
	this._remain = null;
};
/**
 * @public
 * @return {boolean}
 */
ZgaCrypto.BinReader.prototype.isEnd = function(){
	return this._end;
};
/**
 * @public
 * @param {number=} size
 * @return {Uint8Array}
 */
ZgaCrypto.BinReader.prototype.read = function(size){
	/** @const {ZgaCrypto.BinReader} */
	const _this = this;
	/** @const {number} */
	const MIN_SIZE = 3;
	if(_this._end){
		return null;
	}
	if(size){
		if(size < MIN_SIZE){
			throw new Error("size is too small.");
		}
	}else{
		size = 160000;
	}
	if(!_this._strm){
		/** @type {string} */
		var subcmd = '[byte[]]$b=@(0,0);$n=$f.Read($b,0,2);';
		if(_this._size >= MIN_SIZE){
			/** @type {number} */
			var odd = _this._size % 2;
			if(odd){
				subcmd = '[byte[]]$b=@(0,0,0);$n=$f.Read($b,0,2);$n=$f.Seek($f.Length-1,0);$b[2]=$f.ReadByte();';
			}
		}
		/** @type {string} */
		var cmd = '$f=[System.IO.File]::OpenRead(\\"' + _this._path + '\\");' + subcmd + '$f.Close();echo ($b -join \\",\\");';
		/** @type {?ExecReturn} */
		var exeret = ZgaCrypto.execPshCommand(cmd);
		if(!exeret){
			throw new Error("Failed to execute command.");
		}else if(exeret._err){
			throw new Error(exeret._err);
		}
		/** @type {Array<number>} */
		var byts = exeret.out.split(",").map(function(a_s){
			return parseInt(a_s, 10);
		});
		if(_this._size <= MIN_SIZE){
			_this._end = true;
			return new Uint8Array(byts);
		}
		if(byts.length == 3){
			_this._lastByte = byts.pop();
		}
		if(byts[0] == 0xFF && byts[1] == 0xFE){
			_this._remain = byts;
			_this._le = true;
		}else if(byts[0] == 0xFE && byts[1] == 0xFF){
			_this._remain = byts;
			_this._le = false;
		}
		_this._strm = fso.OpenTextFile(_this._path, 1, false, -1);
	}

	/** @type {Uint8Array} */
	var u8arr = null;
	if(!_this._strm.AtEndOfStream){
		/** @type {number} */
		var rsz = (_this._remain ? (size - _this._remain.length) : size) / 2;
		/** @type {number} */
		var rsz2 = Math.ceil(rsz);
		/** @type {string} */
		var str = _this._strm.Read(rsz2);

		u8arr = new Uint8Array((_this._remain ? _this._remain.length : 0) + (str.length * 2));
		/** @type {DataView} */
		var vw = new DataView(u8arr.buffer);
		/** @type {number} */
		var j = 0;
		/** @type {number} */
		var i = 0;
		if(_this._remain){
			while(i < _this._remain.length){
				vw.setUint8(j, _this._remain[i]);
				i++;
				j++;
			}
			i = 0;
			_this._remain = null;
		}
		while(i < str.length){
			vw.setUint16(j, str.charCodeAt(i), _this._le);
			i++;
			j += 2;
		}
		if(u8arr.length > size && rsz2 > rsz){
			i = u8arr.length - 1;
			_this._remain = [ u8arr[i] ];
			u8arr = u8arr.slice(0, i);
		}

	}else if(_this._remain){
		u8arr = new Uint8Array(_this._remain);
		_this._remain = null;
	}

	if(!u8arr || u8arr.length < size){
		_this._end = true;
		if(_this._lastByte >= 0){
			u8arr = _this.pushU8Array(u8arr, _this._lastByte);
		}
	}

	return u8arr;
};
/**
 * @private
 * @param {Uint8Array} u8arr
 * @param {number} num
 * @return {Uint8Array}
 */
ZgaCrypto.BinReader.prototype.pushU8Array = function(u8arr, num){
	if(u8arr){
		return u8arr.push(num);
	}else{
		return new Uint8Array([num]);
	}
};

/**
 * @constructor
 * @param {string} _fpath
 */
ZgaCrypto.BinWriter = function(_fpath){
	/** @private @type {string} */
	this._path = _fpath;
	/** @private @type {boolean} */
	this._le = ZgaCrypto.isSysLe;
	/** @private @type {number} */
	this._lastByte = -1;
	/** @private @type {TextStream} */
	this._strm = null;
};
/**
 * @public
 */
ZgaCrypto.BinWriter.prototype.close = function(){
	if(this._strm){
		this._strm.Close();
		this._strm = null;
	}
	if(this._lastByte >= 0){
		var cmd = '$f=[System.IO.File]::OpenWrite(\\"' + this._path + '\\");$n=$f.Seek($f.Length,0);$f.WriteByte(' + this._lastByte + ');$f.Close();';
		ZgaCrypto.execPshCommand(cmd);
	}
};
/**
 * @public
 * @param {Uint8Array} dat
 */
ZgaCrypto.BinWriter.prototype.write = function(dat){
	/** @const {ZgaCrypto.BinWriter} */
	const _this = this;
	/** @type {Uint8Array} */
	var dat2 = dat;
	if(_this._lastByte >= 0){
		if(dat){
			dat2 = new Uint8Array(dat.length + 1);
			dat2.set(dat, 1);
		}else{
			dat2 = new Uint8Array(1);
		}
		dat2[0] = _this._lastByte;
		_this._lastByte = -1;
	}
	if(!dat2){
		return;
	}
	if(dat2.length % 2){
		_this._lastByte = dat2[dat2.length - 1];
		dat2 = dat2.slice(0, dat2.length - 1);
	}
	if(dat2.length == 0){
		return;
	}

	if(!_this._strm){
		if(dat2[0] == 0xFF && dat2[1] == 0xFE){
			_this._le = true;
		}else if(dat2[0] == 0xFE && dat2[1] == 0xFF){
			_this._le = false;
		}
		dat2 = _this.writeFirst2Bytes(dat2);
		_this._strm = fso.OpenTextFile(_this._path, 8, true, -1);
	}
	if(dat2.length == 0){
		return;
	}

	// alert(JSON.stringify(dat2));
	/** @type {DataView} */
	var vw = new DataView(dat2.buffer);
	/** @type {string} */
	var str = "";
	/** @type {number} */
	var i = 0;
	while(i < dat2.length){
		str += String.fromCharCode(vw.getUint16(i, _this._le));
		i += 2;
	}
	_this._strm.Write(str);
};
/**
 * @private
 * @param {string} raw
 * @return {VBytes}
 */
ZgaCrypto.BinWriter.prototype.rawToVbBytes = function(raw){
	/** @type {!ActiveXObject} */
	var xml = new ActiveXObject("Microsoft.XMLDOM");
	xml.async = false;
	var node = xml.createElement("binary");
	node.dataType = "bin.base64";
	node.text = btoa(raw);
	return node.nodeTypedValue;
};
/**
 * @private
 * @param {Uint8Array} u8arr
 * @return {Uint8Array}
 */
ZgaCrypto.BinWriter.prototype.writeFirst2Bytes = function(u8arr){
	/** @type {string} */
	var raw = String.fromCharCode(u8arr[0]) + String.fromCharCode(u8arr[1]);
	/** @type {VBytes} */
	var vbyts = this.rawToVbBytes(raw);
	var ado = /** @type {ADOStream} */(api.CreateObject("ads"));
	ado.Type = adTypeBinary;
	ado.Open();
	ado.Write(vbyts);
	ado.SaveToFile(this._path, adSaveCreateOverWrite);
	ado.Close();
	return u8arr.slice(2);
};