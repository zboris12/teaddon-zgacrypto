/**
 * @param {string} forgepath
 * @return {boolean}
 */
ZgaCrypto.initCryptoEnv = function(forgepath){
	if(!window.URL.prototype){
		// alert("Fix URL for node-forge.");
		var oldURL = window.URL; //{"createObjectURL","revokeObjectURL"}
		/**
		 * @constructor
		 * @param {string=} href
		 * @suppress {checkTypes|constantProperty}
		 */
		window.URL = function(href){
			this.searchParams = {
				/**
				 * @public
				 * @param {string} key
				 * @return {boolean}
				 */
				has: function(key){
					return false;
				},
				/**
				 * @public
				 * @param {string} key
				 * @return {string|undefined}
				 */
				get: function(key){
					return undefined;
				}
			};
		};
		if(oldURL){
			Object.keys(oldURL).forEach(function(key){
				window.URL[key] = oldURL[key];
			});
		}
	}
	if(!window.forge){
		// alert("Load forge.");
		if(!fso.FileExists(forgepath)){
			/** @type {number} */
			var hret = api.URLDownloadToFile(null, "https://cdn.jsdelivr.net/npm/node-forge@1.0.0/dist/forge.min.js", forgepath);
			if(hret != 0){
				alert("Failed to download forge.min.js.\nPlease download it by yourself and save it to\n"+forgepath);
				return false;
			}
		}
		if(fso.FileExists(forgepath)){
			importScript(forgepath);
		}else{
			alert("Failed to load forge.min.js.\nPlease make sure it has been saved to\n"+forgepath);
			return false;
		}
	}
	return true;
};

/**
 * @typedef
 * {{
 *    _key: string,
 *    _iv: string,
 * }}
 */
var CryptoSecrets;

/**
 * @param {string} _pwd
 * @param {string=} _salt
 * @return {CryptoSecrets}
 */
ZgaCrypto.deriveSecrets = function(_pwd, _salt){
	/** @const {number} */
	const _keySize = 256 / 8;
	/** @const {number} */
	const _ivSize = 128 / 8;
	if(!_salt){
		/** @type {forge.md.digest} */
		var md = forge.md.sha512.create();
		md.update(_pwd);
		_salt = md.digest().getBytes();
	}

	/** @type {string} */
	var srtstr = forge.pbkdf2(_pwd, _salt, 10000, _keySize + _ivSize, "sha256");
	return {
		_key: srtstr.substring(0, _keySize),
		_iv: srtstr.substring(_keySize),
	};
};

/**
 * Only the same user on the same computer who encrypted the data can decrypt the data.
 *
 * @param {string} _dat
 * @param {string} _key
 * @return {Uint8Array}
 */
ZgaCrypto.encryptLocal = function(_dat, _key){
	/** @type {string} */
	var enc = api.CryptProtectData(_dat, _key, true);
	return Uint8Array.fromBstr(enc);
};
/**
 * @param {Uint8Array} _dat
 * @param {string} _key
 * @return {string}
 */
ZgaCrypto.decryptLocal = function(_dat, _key){
	/** @type {string} */
	var dat = _dat.toBstr();
	/** @type {string} */
	var dec = api.CryptUnprotectData(dat, _key, true);
	return dec;
};

/**
 * @constructor
 * @param {Array<FolderItem>} _fis
 * @param {boolean} _encrypt
 * @param {string} _pwd
 * @param {Array<string>=} _keyfs
 * @extends {ZgaCrypto.ProgessBar}
 */
ZgaCrypto.FilesCryptor = function(_fis, _encrypt, _pwd, _keyfs){
	this.super();
	/** @private @type {boolean} */
	this.enc = _encrypt;
	/** @private @type {Array<FolderItem>} */
	this.fis = _fis;
	/** @private @type {ZgaCrypto.BinReader} */
	this.rdr = null;
	/** @private @type {ZgaCrypto.BinWriter} */
	this.wtr = null;

	/** @private @type {CryptoSecrets} */
	this.scs = this.deriveSecrets(_pwd, _keyfs);
	/** @private @type {forge.cipher.BlockCipher} */
	this.cryptor = null;
};
ZgaCrypto.ProgessBar.inherit(ZgaCrypto.FilesCryptor);
/**
 * @override
 * @public
 */
ZgaCrypto.FilesCryptor.prototype.open = function(){
	this.superCall("open", this.fis.length);
};
/**
 * @override
 * @protected
 */
ZgaCrypto.FilesCryptor.prototype.dispose = function(){
	if(this.rdr){
		this.rdr.close();
		this.rdr = null;
	}
	if(this.wtr){
		this.wtr.close();
		this.wtr = null;
	}
	if(this.cryptor){
		this.cryptor = null;
	}
};
/**
 * @override
 * @protected
 * @return {string}
 */
ZgaCrypto.FilesCryptor.prototype.prepareHdStep = function(){
	/** @type {FolderItem} */
	var fi = this.fis[this.hdStep];
	this.rdr = new ZgaCrypto.BinReader(fi);
	this.wtr = new ZgaCrypto.BinWriter(fi.Path + (this.enc ? ".enc" : ".dec"));
	/** @type {forge.util.ByteBuffer} */
	var key2 = new forge.util.ByteBuffer(this.scs._key);
	if(this.enc){
		this.cryptor = forge.cipher.createCipher("AES-CBC", key2);
	}else{
		this.cryptor = forge.cipher.createDecipher("AES-CBC", key2);
	}
	this.cryptor.start({iv: this.scs._iv});
	this.size = fi.Size;
	this.pos = 0;
	this.stepForward(0);

	return (this.enc ? "Encrypting " : "Decrypting") + fi.Name;
};
/**
 * @override
 * @protected
 */
ZgaCrypto.FilesCryptor.prototype.step = function(){
	if(!this.cryptor){
		this.hdStepForward();
	}else{
		/** @const {number} */
		const bufsz = 500000;
		/** @type {Uint8Array} */
		var u8 = this.rdr.read(bufsz);
		this.consume(u8, this.rdr.isEnd());
		this.stepForward(bufsz);
		if(this.rdr.isEnd()){
			this.dispose();
		}
	}
};
/**
 * @private
 * @param {Uint8Array} _u8
 * @param {boolean=} _final
 */
ZgaCrypto.FilesCryptor.prototype.consume = function(_u8, _final){
	if(_u8){
		/** @type {forge.util.ByteBuffer} */
		var wdat = new forge.util.ByteBuffer(_u8);
		this.cryptor.update(wdat);
	}else if(!_final){
		return;
	}
	if(_final){
		this.cryptor.finish();
	}
	/** @type {string} */
	var ret2 = this.cryptor.output.getBytes();
	/** @type {Uint8Array} */
	var ret3 = Uint8Array.fromRaw(ret2);
	this.wtr.write(ret3);
};
/**
 * @private
 * @param {string} _pwd
 * @param {Array<string>=} _keyfs
 * @return {CryptoSecrets}
 */
ZgaCrypto.FilesCryptor.prototype.deriveSecrets = function(_pwd, _keyfs){
	/** @type {string} */
	var key = "";
	if(_keyfs && _keyfs.length){
		/** @type {forge.md.digest} */
		var md = forge.md.sha256.create();
		/** @type {number} */
		var i = 0;
		while(i < _keyfs.length){
			md.update(this.loadKey(_keyfs[i]));
		}
		key = md.digest().getBytes();
		return ZgaCrypto.deriveSecrets(key, _pwd);
	}else{
		return ZgaCrypto.deriveSecrets(_pwd);
	}
};
/**
 * @private
 * @param {string} _keyf
 * @return {string}
 */
ZgaCrypto.FilesCryptor.prototype.loadKey = function(_keyf){
	if(_keyf.substring(0, 8) == "https://"){
		/** @type {XMLHttpRequest} */
		var xhr = createHttpRequest();
		xhr.open("GET", _keyf, false);
		xhr.send(null);
		if(xhr.status >= 200 && xhr.status <= 299){
			return xhr.responseText;
		}else{
			throw new Error("Failed to load key file. " + xhr.status + "\n" + _keyf);
		}

	}else if(fso.FileExists(_keyf)){
		/** @type {FolderItem} */
		var fi = fso.GetFile(_keyf);
		/** @type {ZgaCrypto.BinReader} */
		var kdr = new ZgaCrypto.BinReader(fi);
		/** @type {Uint8Array} */
		var u8arr = kdr.readAll();
		return u8arr.toRaw();
	}else{
		throw new Error("Can't load key file.\n" + _keyf);
	}
};