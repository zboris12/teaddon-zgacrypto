/**
 * @abstract
 * @constructor
 * @param {string} _fpath
 */
ZgaCrypto.BinFile = function(_fpath){
	/** @protected @const {number} */
	this.FILE_BEGIN = 0;
	/** @protected @const {number} */
	this.FILE_CURRENT = 1;
	/** @protected @const {number} */
	this.FILE_END = 2;
	/** @private @type {string} */
	this._path = _fpath;
	/** @private @type {number} */
	this._hdl = 0;
};
/**
 * @protected
 * @param {boolean=} forwrite
 */
ZgaCrypto.BinFile.prototype.open = function(forwrite){
	/** @const {number} */
	const GENERIC_WRITE = 0x40000000;
	/** @const {number} */
	const GENERIC_READ = 0x80000000;
	/** @const {number} */
	const FILE_SHARE_READ = 0x00000001;
	/** @const {number} */
	const CREATE_ALWAYS = 2;
	/** @const {number} */
	const OPEN_EXISTING = 3;
	/** @const {number} */
	const FILE_ATTRIBUTE_NORMAL = 128;
	if(forwrite){
		this._hdl = api.CreateFile(this._path, GENERIC_WRITE, FILE_SHARE_READ, null, CREATE_ALWAYS, FILE_ATTRIBUTE_NORMAL, null);
	}else{
		this._hdl = api.CreateFile(this._path, GENERIC_READ, FILE_SHARE_READ, null, OPEN_EXISTING, FILE_ATTRIBUTE_NORMAL, null);
	}
	if(!this._hdl){
		throw new Error("Failed to open file.");
	}
};
/**
 * @public
 */
ZgaCrypto.BinFile.prototype.close = function(){
	if(this._hdl){
		api.CloseHandle(this._hdl);
		this._hdl = 0;
	}
};

/**
 * @constructor
 * @param {FolderItem} _fitm
 * @extends {ZgaCrypto.BinFile}
 */
ZgaCrypto.BinReader = function(_fitm){
	this.super(_fitm.Path);
	/** @private @type {number} */
	this._size = _fitm.Size;
	/** @private @type {boolean} */
	this._end = false;
	/** @private @type {Array<number>} */
	this._remain = null;
};
ZgaCrypto.BinFile.inherit(ZgaCrypto.BinReader);
/**
 * @override
 * @public
 */
ZgaCrypto.BinReader.prototype.close = function(){
	this.superCall("close");
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
 * @return {Uint8Array}
 */
ZgaCrypto.BinReader.prototype.readAll = function(){
	/** @type {Uint8Array} */
	var u8arr = this.read(this._size);
	this.close();
	return u8arr;
};
/**
 * @public
 * @param {number=} size
 * @return {Uint8Array}
 */
ZgaCrypto.BinReader.prototype.read = function(size){
	/** @const {ZgaCrypto.BinReader} */
	const _this = this;
	if(_this._end){
		return null;
	}
	if(!size){
		size = 160000;
	}
	if(!_this._hdl){
		_this.open();
	}

	/** @type {number} */
	var rsz = (_this._remain ? (size - _this._remain.length) : size);
	/** @type {number} */
	var rsz2 = rsz + (rsz % 2);
	/** @type {string} */
	var str = rsz2 ? api.ReadFile(_this._hdl, rsz2) : "";
	/** @type {number} */
	var retsz = str.length * 2;
	if(rsz2 && retsz < rsz2){
		_this._end = true;
	}

	retsz += (_this._remain ? _this._remain.length : 0);
	/** @type {Uint8Array} */
	var u8arr = null;
	if(retsz){
		u8arr = new Uint8Array(retsz);
		/** @type {number} */
		var j = 0;
		if(_this._remain){
			u8arr.set(_this._remain, j);
			j += _this._remain.length;
			_this._remain = null;
		}
		if(str){
			/** @type {!Uint8Array} */
			var udat = Uint8Array.fromBstr(str);
			u8arr.set(udat, j);
			j += udat.length;
		}
		if(retsz > size && rsz2 > rsz){
			/** @type {number} */
			var i = u8arr.length - 1;
			_this._remain = [ u8arr[i] ];
			u8arr = u8arr.slice(0, i);
		}

	}else if(_this._remain){
		u8arr = new Uint8Array(_this._remain);
		_this._remain = null;
	}

	if(_this._end && _this._size % 2){
		// Get last byte.
		api.SetFilePointer(_this._hdl, -2, _this.FILE_END);
		str = api.ReadFile(_this._hdl, 2);
		/** @type {!Uint8Array} */
		var u8last = Uint8Array.fromBstr(str);
		u8arr = _this.pushU8Array(u8arr, u8last[1]);
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
 * @extends {ZgaCrypto.BinFile}
 */
ZgaCrypto.BinWriter = function(_fpath){
	this.super(_fpath);
	/** @private @type {number} */
	this._lastByte = -1;
};
ZgaCrypto.BinFile.inherit(ZgaCrypto.BinWriter);

/**
 * @override
 * @public
 */
ZgaCrypto.BinWriter.prototype.close = function(){
	this.writeLastByte();
	this.superCall("close");
};
/**
 * @public
 * @param {Uint8Array} dat
 */
ZgaCrypto.BinWriter.prototype.write = function(dat){
	if(!this._hdl){
		this.open(true);
	}
	// Use CteMemory to write is slower than BSTR.
	// /** @type {CteMemory<number>} */
	// var om = api.Memory("BYTE", dat.length);
	// /** @type {number} */
	// var i = 0;
	// while(i < dat.length){
		// om[i] = dat[i];
		// i++;
	// }
	// api.WriteFile(this._hdl, om);
	// om.Free(true);

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

	/** @type {string} */
	var str = dat2.toBstr();
	api.WriteFile(_this._hdl, str);
};
/**
 * @private
 */
ZgaCrypto.BinWriter.prototype.writeLastByte = function(){
	if(this._lastByte < 0){
		return;
	}
	/** @type {CteMemory<number>} */
	var om = api.Memory("BYTE", 1);
	om[0] = this._lastByte;
	this._lastByte = -1;
	api.WriteFile(this._hdl, om);
	om.Free(true);
};
