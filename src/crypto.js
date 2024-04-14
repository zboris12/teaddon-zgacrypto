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
 * @typedef
 * {{
 *    _pwd: (string|undefined),
 *    _keyfs: (Array<string>|undefined),
 *    _default: (number|undefined),
 * }}
 * _default: 0 no default, 1 load default secrets, 2 save as default.
 */
var CryptoPwdKey;
/**
 * @typedef
 * {{
 *    _key: string,
 *    _iv: string,
 * }}
 */
var CryptoSecrets;

/**
 * @param {CryptoPwdKey} _pwdkey
 * @return {CryptoSecrets}
 */
ZgaCrypto.deriveSecrets = function(_pwdkey){
	if(_pwdkey._default == 1){
		//TODO load default secrets
		return {
			_key: "some key",
			_iv: "some iv"
		};
	}

	/**
	 * @param {string} _keyf
	 * @return {string}
	 */
	var loadKey = function(_keyf){
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
	/**
	 * @param {string} _k1
	 * @param {string} _k2
	 * @return {number}
	 */
	var compareKeyf = function(_k1, _k2){
		if(_k1.toLowerCase() < _k2.toLowerCase()){
			return -1;
		}else{
			return 1;
		}
	};

	// Generate password and salt.
	/** @type {string} */
	var pwd = "";
	/** @type {string} */
	var salt = "";
	if(_pwdkey._keyfs && _pwdkey._keyfs.length){
		_pwdkey._keyfs.sort(compareKeyf);
		/** @type {forge.md.digest} */
		var md = forge.md.sha256.create();
		/** @type {number} */
		var i = 0;
		/** @type {string} */
		var lastKey = "";
		while(i < _pwdkey._keyfs.length){
			if(_pwdkey._keyfs[i] && _pwdkey._keyfs[i] != lastKey){
				lastKey = _pwdkey._keyfs[i];
				md.update(loadKey(lastKey));
			}
			i++;
		}
		if(lastKey){
			pwd = md.digest().getBytes();
			if(_pwdkey._pwd){
				salt = _pwdkey._pwd;
			}
		}
	}
	if(!pwd){
		if(_pwdkey._pwd){
			pwd = _pwdkey._pwd;
		}else{
			throw new Error("No password nor key file specified.");
		}
	}

	// Derive secrets by password and salt.
	/** @const {number} */
	const _keySize = 256 / 8;
	/** @const {number} */
	const _ivSize = 128 / 8;
	if(!salt){
		/** @type {forge.md.digest} */
		var md2 = forge.md.sha512.create();
		md2.update(pwd);
		salt = md2.digest().getBytes();
	}
	/** @type {string} */
	var srtstr = forge.pbkdf2(pwd, salt, 10000, _keySize + _ivSize, "sha256");
	/** @type {CryptoSecrets} */
	var ret = {
		_key: srtstr.substring(0, _keySize),
		_iv: srtstr.substring(_keySize),
	};

	if(_pwdkey._default == 2){
		//TODO save secrets as default.
		var TODO = 0;
	}

	return ret;
};

/**
 * @typedef
 * {{
 *    _str: string,
 *    _tag: (string|undefined),
 * }}
 */
var CryptoStringOutput;
/**
 * @param {boolean} _encflg
 * @param {string|CryptoStringOutput} _in
 * @param {string|CryptoSecrets} _pwd
 * @param {string=} _algo
 * @return {CryptoStringOutput}
 */
ZgaCrypto.cryptString = function(_encflg, _in, _pwd, _algo){
	/** @type {string} */
	var str = _in._str || /** @type {string} */(_in);
	if(_encflg){
		str = forge.util.encodeUtf8(str);
	}
	/** @type {string} */
	var algo = _algo || "AES-CBC";
	/** @type {CryptoSecrets|null} */
	var tscs = null;
	if(typeof _pwd == "string"){
		tscs = ZgaCrypto.deriveSecrets({
			_pwd: _pwd,
		});
	}else{
		tscs = _pwd;
	}

	/** @type {CipherOptions} */
	var opts = {
		iv: tscs._iv
	};
	if(algo == "AES-GCM"){
		opts = {
			iv: tscs._iv.substring(0, 12),
			additionalData: tscs._iv.substring(12),
		};
		if(!_encflg){
			opts.tag = _in._tag;
		}
	}

	/** @type {forge.util.ByteBuffer} */
	var trky = new forge.util.ByteBuffer(tscs._key);
	/** @type {forge.cipher.BlockCipher} */
	var tr = _encflg ? forge.cipher.createCipher(algo, trky) : forge.cipher.createDecipher(algo, trky);
	tr.start(opts);
	/** @type {forge.util.ByteBuffer} */
	var wdat = new forge.util.ByteBuffer(str);
	tr.update(wdat);
	tr.finish();
	/** @type {CryptoStringOutput} */
	var ret = {
		_str: tr.output.getBytes(),
	};
	if(_encflg){
		if(algo == "AES-GCM"){
			ret._tag = tr.mode.tag.getBytes();
		}
	}else{
		ret._str = forge.util.decodeUtf8(ret._str);
	}
	return ret;
};

/**
 * @typedef
 * {{
 *    _encrypt: (boolean|undefined),
 *    _algorithm: (string|undefined),
 *    _secrets: (CryptoSecrets),
 *    _outext: (string|undefined),
 * }}
 */
var CryptoOptions;

/**
 * @constructor
 * @param {Array<FolderItem>} _fis
 * @param {CryptoOptions} _opt
 * @extends {ZgaCrypto.ProgessBar}
 */
ZgaCrypto.FilesCryptor = function(_fis, _opt){
	this.super();
	/** @private @type {boolean} */
	this.enc = _opt._encrypt || false;
	/**
	 * @private
	 * @type {string}
	 * valid values are "AES-ECB","AES-CBC","AES-CFB","AES-OFB","AES-CTR","AES-GCM"
	 */
	this.algo = _opt._algorithm || "AES-CBC";
	/**
	 * @private
	 * @type {string}
	 * "-" means remove the extension.
	 */
	this.outext = _opt._outext || (this.enc ? "enc" : "dec");
	/** @private @type {Array<FolderItem>} */
	this.fis = _fis;
	/** @private @type {ZgaCrypto.BinReader} */
	this.rdr = null;
	/** @private @type {ZgaCrypto.BinWriter} */
	this.wtr = null;

	/** @private @type {CryptoSecrets} */
	this.scs = _opt._secrets;
	/** @private @type {forge.cipher.BlockCipher} */
	this.cryptor = null;
};
ZgaCrypto.FilesCryptor.inherit(ZgaCrypto.ProgessBar);
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
	this.wtr = new ZgaCrypto.BinWriter(this.getOutPath(fi.Path));
	/** @type {forge.util.ByteBuffer} */
	var key2 = new forge.util.ByteBuffer(this.scs._key);
	if(this.enc){
		this.cryptor = forge.cipher.createCipher(this.algo, key2);
	}else{
		this.cryptor = forge.cipher.createDecipher(this.algo, key2);
	}
	this.cryptor.start({iv: this.scs._iv});
	this.size = fi.Size;
	this.pos = 0;
	this.stepForward(0);

	return (this.enc ? "Encrypting " : "Decrypting ") + fi.Name;
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
 * @param {string} _in
 * @return {string}
 */
ZgaCrypto.FilesCryptor.prototype.getOutPath = function(_in){
	/** @type {string} */
	var fb = _in;
	/** @type {string} */
	var ext = this.outext;
	if(ext == "-"){
		/** @type {string} */
		var e = fso.GetExtensionName(_in);
		if(e){
			/** @type {string} */
			var p = fso.GetParentFolderName(_in);
			/** @type {string} */
			var b = fso.GetBaseName(_in);
			/** @type {string} */
			var bb = fso.GetBaseName(b);
			fb = fso.BuildPath(p, bb);
			if(b != bb){
				ext = fso.GetExtensionName(b);
			}
		}
	}

	ext = "." + ext;
	/** @type {number} */
	var i = 0;
	/** @type {string} */
	var f = fb + ext;
	while(fso.FileExists(f)){
		i++;
		f = fb + "(" + i +")" + ext;
	}
	return f;
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
 * @constructor
 * @param {Array<FolderItem>} _fis
 * @param {string=} _algorithm
 * @extends {ZgaCrypto.ProgessBar}
 */
ZgaCrypto.FilesHasher = function(_fis, _algorithm){
	this.super();
	/**
	 * @private
	 * @type {string}
	 * valid values are "md5","sha1","sha256","sha512"
	 */
	this.algo = _algorithm || "md5";
	/** @private @type {Array<FolderItem>} */
	this.fis = _fis;
	/** @private @type {ZgaCrypto.BinReader} */
	this.rdr = null;
	/** @private @type {forge.md.digest} */
	this.md = null;
};
ZgaCrypto.FilesHasher.inherit(ZgaCrypto.ProgessBar);
/**
 * @override
 * @public
 */
ZgaCrypto.FilesHasher.prototype.open = function(){
	this.superCall("open", this.fis.length, true);
};
/**
 * @override
 * @protected
 */
ZgaCrypto.FilesHasher.prototype.dispose = function(){
	if(this.rdr){
		this.rdr.close();
		this.rdr = null;
	}
	if(this.md){
		this.md = null;
	}
};
/**
 * @override
 * @protected
 * @return {string}
 */
ZgaCrypto.FilesHasher.prototype.prepareHdStep = function(){
	/** @type {FolderItem} */
	var fi = this.fis[this.hdStep];
	this.rdr = new ZgaCrypto.BinReader(fi);
	this.md = forge.md[this.algo].create();
	this.md.start();
	this.size = fi.Size;
	this.pos = 0;
	this.stepForward(0);

	return "Calculating hash of " + fi.Name;
};
/**
 * @override
 * @protected
 */
ZgaCrypto.FilesHasher.prototype.step = function(){
	if(!this.md){
		this.hdStepForward();
	}else{
		/** @const {number} */
		const bufsz = 500000;
		/** @type {Uint8Array} */
		var u8 = this.rdr.read(bufsz);
		this.md.update(u8.toRaw());
		this.stepForward(bufsz);
		if(this.rdr.isEnd()){
			/** @type {FolderItem} */
			var fi = this.fis[this.hdStep];
			/** @type {string} */
			var val = this.md.digest().toHex();
			this.appendResult(this.algo + " hash value of " + fi.Name + " :\n" + val + "\n");
			this.dispose();
		}
	}
};

/**
 * @param {function(CryptoPwdKey)} _func A callback function
 * @param {boolean} _hasDefault
 * @param {number} _pwdTyp 0 no password, 1 password no confirm, 2 password with confirm
 * @param {boolean=} _hasKey
 */
ZgaCrypto.askSecrets = function(_func, _hasDefault, _pwdTyp, _hasKey){
	/** @type {TablacusControl} */
	var c = ShowDialog(fso.BuildPath(ZgaCrypto.SRCDIR, "askpwd.html"), {
		MainWindow: MainWindow,
		Modal: true,
		width: 500,
		height: 320,
	});
	AddEventEx(c.Window, "load", function(_evt){
		var doc = /** @type {Document} */(_evt.target);
		/**
		 * @param {boolean=} chkd
		 */
		var changeDefault = function(chkd){
			if(chkd){
				doc.getElementById("trSave").style.display = "none";
				doc.getElementById("trPwd").style.display = "none";
				doc.getElementById("trPwd2").style.display = "none";
				doc.getElementById("trKeyf").style.display = "none";
			}else{
				if(_hasDefault){
					doc.getElementById("trDefault").style.display = "";
					if(_pwdTyp == 2 && _hasKey){
						doc.getElementById("trSave").style.display = "";
					}
				}
				switch(_pwdTyp){
					case 2:
						doc.getElementById("trPwd2").style.display = "";
					case 1:
						doc.getElementById("trPwd").style.display = "";
						break;
				}
				if(_hasKey){
					doc.getElementById("trKeyf").style.display = "";
				}
			}
		};
		AddEventEx(doc.getElementById("btnCancel"), "click", function(){
			c.Window.close();
		});
		AddEventEx(doc.getElementById("btnOk"), "click", function(){
			/** @type {CryptoPwdKey} */
			var cpk = {};
			if(_hasDefault && doc.getElementById("chkDefault").checked){
				cpk._default = 1;
			}else if(_pwdTyp == 2 && doc.getElementById("Password").value != doc.getElementById("Password2").value){
				alert("Password is not same.");
				return;
			}else{
				if(_pwdTyp && doc.getElementById("Password").value){
					cpk._pwd = doc.getElementById("Password").value;
				}
				if(_hasKey && doc.getElementById("Keyfile").value){
					cpk._keyfs = doc.getElementById("Keyfile").value.split("\n");
				}
				if(_hasDefault && _pwdTyp == 2 && _hasKey && doc.getElementById("chkSave").checked){
					cpk._default = 2;
				}
			}
			c.Window.close();
			if(_func){
				_func(cpk);
			}
		});
		AddEventEx(doc.getElementById("btnFiles"), "click", function(){
			var commdlg = /** @type {CommonDialog} */(api.CreateObject("CommonDialog"));
			commdlg.Filter = MakeCommDlgFilter("*.*");
			commdlg.Flags = OFN_FILEMUSTEXIST;
			if(commdlg.ShowOpen()){
				/** @type {string} */
				var fnm = commdlg.FileName;
				/** @type {number} */
				var i = fnm.indexOf(String.fromCharCode(0));
				if(i >= 0){
					fnm = fnm.substring(0, i);
				}
				doc.getElementById("Keyfile").value += fnm + "\n";
			}
		});
		AddEventEx(doc.getElementById("chkDefault"), "change", function(evt2){
			changeDefault(evt2.target.checked);
		});
		changeDefault();
	});
};