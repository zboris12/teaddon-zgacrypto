/**
 * @param {string=} forgepath
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
		if(!forgepath){
			forgepath = ZgaCrypto.getAttribute("forgepath") || fso.BuildPath(ZgaCrypto.SRCDIR, "forge.min.js");
		}
		if(!fso.FileExists(forgepath)){
			/** @const {string} */
			var forgeurl = ZgaCrypto.getAttribute("forgeurl") || "https://cdn.jsdelivr.net/npm/node-forge@1.3.1/dist/forge.min.js";
			/** @type {number} */
			var hret = api.URLDownloadToFile(null, forgeurl, forgepath);
			if(hret != 0){
				alert(forgeurl + "\n" + api.sprintf(100, GetText("Failed to download %s."), "forge.min.js") + "\n" + GetText("Please download it by yourself and save it to") + "\n" + forgepath);
				return false;
			}
		}
		if(fso.FileExists(forgepath)){
			importScript(forgepath);
		}else{
			alert(api.sprintf(100, GetText("Failed to load %s."), "forge.min.js") + "\n" + GetText("Please make sure it has been saved to") + "\n" + forgepath);
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
 * @param {boolean=} forcheck
 * @return {string}
 */
ZgaCrypto.loadDefaultSecrets = function(forcheck){
	/** @type {string} */
	var ret = ZgaCrypto.getAttribute("secrets");
	if(forcheck || !ret){
		return ret;
	}

	/** @type {string} */
	var str = atob(ret);
	/** @const {number} */
	const _rkeySize = 9;
	/** @type {string} */
	var rndkey = str.substring(0, _rkeySize);
	str = str.substring(_rkeySize);
	ret = ZgaCrypto.decryptLocal(Uint8Array.fromRaw(str), rndkey);
	return ret;
};
/**
 * @param {string} str
 */
ZgaCrypto.saveDefaultSecrets = function(str){
	if(ZgaCrypto.addon){
		/** @type {HTMLCollection} */
		var xmlitms = te.Data.Addons.getElementsByTagName(ZgaCrypto.addon.tagName.toLowerCase());
		if(xmlitms.length){
			/** @type {string} */
			var rndkey = forge.random.getBytesSync(9);
			/** @type {Uint8Array} */
			var u8enc = ZgaCrypto.encryptLocal(str, rndkey);
			xmlitms[0].setAttribute("secrets", btoa(rndkey + u8enc.toRaw()));
			RunEvent1("ConfigChanged", "Addons");
		}
	}
};

/**
 * @param {CryptoPwdKey|string} _pwdkey
 * @return {CryptoSecrets}
 */
ZgaCrypto.deriveSecrets = function(_pwdkey){
	/** @const {number} */
	const _keySize = 256 / 8;
	/** @const {number} */
	const _ivSize = 128 / 8;

	if(typeof _pwdkey == "string"){
		_pwdkey = {
			_pwd: _pwdkey,
		};
	}

	if(_pwdkey._default == 1){
		/** @type {string} */
		var dftstr = ZgaCrypto.loadDefaultSecrets();
		if(dftstr){
			return {
				_key: dftstr.substring(0, _keySize),
				_iv: dftstr.substring(_keySize),
			};
		}else{
			throw new Error("There is no default secrets to load.");
		}
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
		//save secrets as default.
		ZgaCrypto.saveDefaultSecrets(srtstr);
	}

	return ret;
};

/** @type {Array<string>} */
ZgaCrypto.ALGORITHMS = null;
/** @const {number} */
ZgaCrypto.AESCBC = 1;
/** @const {number} */
ZgaCrypto.AESGCM = 5;

/**
 * @param {boolean} _encflg
 * @param {string} _in
 * @param {string|CryptoSecrets} _pwd
 * @param {number=} _algo
 * @return {string}
 */
ZgaCrypto.cryptData = function(_encflg, _in, _pwd, _algo){
	/** @type {number} */
	var algo = _algo >= 0 ? _algo : ZgaCrypto.AESCBC;
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
	if(algo == ZgaCrypto.AESGCM){
		opts = {
			iv: tscs._iv.substring(0, 12),
			additionalData: tscs._iv.substring(12),
		};
		if(!_encflg){
			/** @type {number} */
			var taglen = _in.charCodeAt(0);
			opts.tag = _in.substring(1, taglen + 1);
			_in = _in.substring(taglen + 1);
		}
	}

	/** @type {forge.util.ByteBuffer} */
	var trky = new forge.util.ByteBuffer(tscs._key);
	/** @type {forge.cipher.BlockCipher} */
	var tr = _encflg ? forge.cipher.createCipher(ZgaCrypto.ALGORITHMS[algo], trky) : forge.cipher.createDecipher(ZgaCrypto.ALGORITHMS[algo], trky);
	tr.start(opts);
	/** @type {forge.util.ByteBuffer} */
	var wdat = new forge.util.ByteBuffer(_in);
	tr.update(wdat);
	tr.finish();
	/** @type {string} */
	var ret = tr.output.getBytes();
	if(_encflg){
		if(algo == ZgaCrypto.AESGCM){
			/** @type {string} */
			var tag = tr.mode.tag.getBytes();
			ret = String.fromCharCode(tag.length) + tag + ret;
		}
	}
	return ret;
};
/**
 * @param {string} _in // an standard JavaScript string
 * @param {string|CryptoSecrets} _pwd
 * @param {number=} _algo
 * @return {string} // a base64 encoded string
 */
ZgaCrypto.aesEncString = function(_in, _pwd, _algo){
	return btoa(ZgaCrypto.cryptData(true, forge.util.encodeUtf8(_in), _pwd, _algo));
};
/**
 * @param {string} _in // a base64 encoded string
 * @param {string|CryptoSecrets} _pwd
 * @param {number=} _algo
 * @return {string} // an standard JavaScript string
 */
ZgaCrypto.aesDecString = function(_in, _pwd, _algo){
	return forge.util.decodeUtf8(ZgaCrypto.cryptData(false, atob(_in), _pwd, _algo));
};

/**
 * @typedef
 * {{
 *    _encrypt: (boolean|undefined),
 *    _algorithm: (number|undefined),
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
	/** @private @type {number} */
	this.algo = _opt._algorithm >= 0 ? _opt._algorithm : ZgaCrypto.AESCBC;
	/**
	 * @private
	 * @type {string}
	 * "-" means remove the extension.
	 */
	this.outext = _opt._outext || ZgaCrypto.getAttribute(this.enc ? "encext" : "decext", this.enc ? "enc" : "dec");
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
	/** @private @type {string} */
	this.tagpath = "";
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
	/** @type {string} */
	var op = this.getOutPath(fi.Path);
	this.rdr = new ZgaCrypto.BinReader(fi);
	this.wtr = new ZgaCrypto.BinWriter(op);
	/** @type {CipherOptions} */
	var opts = {
		iv: this.scs._iv
	};
	if(this.algo == ZgaCrypto.AESGCM){
		opts = {
			iv: this.scs._iv.substring(0, 12),
			additionalData: this.scs._iv.substring(12),
		};
		if(this.enc){
			this.tagpath = op + ".tag";
		}else{
			opts.tag = this.loadGcmTag(fi.Path);
		}
	}

	/** @type {forge.util.ByteBuffer} */
	var key2 = new forge.util.ByteBuffer(this.scs._key);
	if(this.enc){
		this.cryptor = forge.cipher.createCipher(ZgaCrypto.ALGORITHMS[this.algo], key2);
	}else{
		this.cryptor = forge.cipher.createDecipher(ZgaCrypto.ALGORITHMS[this.algo], key2);
	}
	this.cryptor.start(opts);
	this.pgSize = fi.Size;
	this.pos = 0;
	this.stepForward(0);

	return api.sprintf(100, GetText(this.enc ? "Encrypting %s" : "Decrypting %s"), fi.Name);
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
			if(b == bb){
				ext = "";
			}else{
				ext = fso.GetExtensionName(b);
			}
		}
	}

	if(ext){
		ext = "." + ext;
	}
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
	if(_final && this.tagpath){
		this.saveGcmTag();
	}
};
/**
 * @private
 * @param {string} _path
 * @return {string}
 */
ZgaCrypto.FilesCryptor.prototype.loadGcmTag = function(_path){
	/** @type {string} */
	var tagp = _path + ".tag";
	if(!fso.FileExists(tagp)){
		throw new Error("Need tag file to decrypt. " + tagp);
	}
	/** @type {FolderItem} */
	var ftag = fso.GetFile(tagp);
	/** @type {ZgaCrypto.BinReader} */
	var tagdr = new ZgaCrypto.BinReader(ftag);
	/** @type {Uint8Array} */
	var u8tag = tagdr.readAll();
	return u8tag.toRaw();
};
/**
 * @private
 */
ZgaCrypto.FilesCryptor.prototype.saveGcmTag = function(){
	/** @type {string} */
	var tag = this.cryptor.mode.tag.getBytes();
	/** @type {ZgaCrypto.BinWriter} */
	var tagtr = new ZgaCrypto.BinWriter(this.tagpath);
	tagtr.write(Uint8Array.fromRaw(tag));
	tagtr.close();
	this.tagpath = "";
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
	this.pgSize = fi.Size;
	this.pos = 0;
	this.stepForward(0);

	return api.sprintf(100, GetText("Calculating hash of %s"), fi.Name);
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
			this.appendResult(api.sprintf(100, GetText("%s 's %s hash value:"), fi.Name, this.algo) + "\n" + val + "\n");
			this.dispose();
		}
	}
};

/**
 * @param {function(CryptoPwdKey, number)} _func A callback function
 * @param {boolean} _hasDefault
 * @param {number} _pwdTyp 0 no password, 1 password no confirm, 2 password with confirm
 * @param {boolean=} _hasKey
 */
ZgaCrypto.askSecrets = function(_func, _hasDefault, _pwdTyp, _hasKey){
	/** @type {TablacusControl} */
	var c = ShowDialog(fso.BuildPath(ZgaCrypto.SRCDIR, "askpwd.html"), {
		MainWindow: window.MainWindow,
		Modal: true,
		width: 500,
		height: 390,
	});
	AddEventEx(c.Window, "load", function(_evt){
		var doc = /** @type {Document} */(_evt.target);
		ApplyLang(doc);
		/** @type {Element} */
		var sel = doc.getElementById("Algorithm");
		/** @type {number} */
		var defalgo = parseInt(ZgaCrypto.getAttribute("algorithm", ZgaCrypto.AESCBC.toString(10)), 10);
		ZgaCrypto.ALGORITHMS.forEach(function(a_algo, a_idx){
			/** @type {Element} */
			var a_opt = doc.createElement("option");
			a_opt.value = a_idx;
			a_opt.innerText = a_algo;
			if(a_idx == defalgo){
				a_opt.selected = true;
			}
			sel.appendChild(a_opt);
		});
		if(_pwdTyp == 2){
			AddEventEx(sel, "change", function(evt2){
				if(evt2.target.value == ZgaCrypto.AESGCM){
					evt2.target.nextElementSibling.style.display = "block";
				}else{
					evt2.target.nextElementSibling.style.display = "none";
				}
			});
		}

		/**
		 * @param {boolean=} chkd
		 */
		var changeDefault = function(chkd){
			if(chkd){
				doc.getElementById("trPwd").style.display = "none";
				doc.getElementById("trPwd2").style.display = "none";
				doc.getElementById("trKeyf").style.display = "none";
				doc.getElementById("trSave").style.display = "none";
			}else{
				if(_hasDefault){
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
				_func(cpk, doc.getElementById("Algorithm").value);
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
		AddEventEx(doc.getElementById("chkDefault"), "change", function(evt3){
			changeDefault(evt3.target.checked);
		});
		if(_hasDefault && ZgaCrypto.loadDefaultSecrets(true)){
			doc.getElementById("trDefault").style.display = "";
		}
		doc.getElementById("trAlgo").style.display = "";
		changeDefault();
	});
};

/**
 * @param {TablacusControl=} Ctrl
 * @param {Object=} pt
 * @return {Array<FolderItem>}
 */
ZgaCrypto.getSelectedFiles = function(Ctrl, pt){
	/** @type {FolderView} */
	var FV = GetFolderView(Ctrl, pt);
	/** @type {FolderItems} */
	var Selected = FV.SelectedItems();
	/** @type {Array<FolderItem>} */
	var fiarr = new Array();
	/** @type {number} */
	var i = 0;
	while(i<Selected.Count){
		if(fso.FileExists(Selected.Item(i).Path)){
			fiarr.push(Selected.Item(i));
		}
		i++;
	}
	if(fiarr.length == 0){
		alert(GetText("No files selected."));
		return null;
	}else{
		return fiarr;
	}
};
/**
 * @param {TablacusControl=} Ctrl
 * @param {Object=} pt
 */
ZgaCrypto.encryptFiles = function(Ctrl, pt){
	if(!ZgaCrypto.initCryptoEnv()){
		return;
	}
	/** @type {Array<FolderItem>} */
	var fiarr = ZgaCrypto.getSelectedFiles(Ctrl, pt);
	if(!fiarr){
		return;
	}

	ZgaCrypto.askSecrets(function(_pwdkey, _algo){
		/** @type {CryptoSecrets} */
		var fscs = ZgaCrypto.deriveSecrets(_pwdkey);
		/** @type {ZgaCrypto.FilesCryptor} */
		var fcptr = new ZgaCrypto.FilesCryptor(fiarr, {
			_algorithm: _algo,
			_encrypt: true,
			_secrets: fscs,
		});
		fcptr.open();
	}, true, 2, true);
};
/**
 * @param {TablacusControl=} Ctrl
 * @param {Object=} pt
 */
ZgaCrypto.decryptFiles = function(Ctrl, pt){
	if(!ZgaCrypto.initCryptoEnv()){
		return;
	}
	/** @type {Array<FolderItem>} */
	var fiarr = ZgaCrypto.getSelectedFiles(Ctrl, pt);
	if(!fiarr){
		return;
	}
	ZgaCrypto.askSecrets(function(_pwdkey, _algo){
		/** @type {CryptoSecrets} */
		var fscs = ZgaCrypto.deriveSecrets(_pwdkey);
		/** @type {ZgaCrypto.FilesCryptor} */
		var fcptr = new ZgaCrypto.FilesCryptor(fiarr, {
			_algorithm: _algo,
			_secrets: fscs,
		});
		fcptr.open();
	}, true, 1, true);
};
/**
 * @param {string} hash
 * @param {TablacusControl=} Ctrl
 * @param {Object=} pt
 */
ZgaCrypto.hashFiles = function(hash, Ctrl, pt){
	if(!ZgaCrypto.initCryptoEnv()){
		return;
	}
	/** @type {Array<FolderItem>} */
	var fiarr = ZgaCrypto.getSelectedFiles(Ctrl, pt);
	if(!fiarr){
		return;
	}
	/** @type {ZgaCrypto.FilesHasher} */
	var fhsr = new ZgaCrypto.FilesHasher(fiarr, hash);
	fhsr.open();
};
/**
 * @param {TablacusControl=} Ctrl
 * @param {Object=} pt
 */
ZgaCrypto.md5Files = function(Ctrl, pt){
	ZgaCrypto.hashFiles("md5", Ctrl, pt);
};
/**
 * @param {TablacusControl=} Ctrl
 * @param {Object=} pt
 */
ZgaCrypto.sha1Files = function(Ctrl, pt){
	ZgaCrypto.hashFiles("sha1", Ctrl, pt);
};
/**
 * @param {TablacusControl=} Ctrl
 * @param {Object=} pt
 */
ZgaCrypto.sha256Files = function(Ctrl, pt){
	ZgaCrypto.hashFiles("sha256", Ctrl, pt);
};
/**
 * @param {TablacusControl=} Ctrl
 * @param {Object=} pt
 */
ZgaCrypto.sha512Files = function(Ctrl, pt){
	ZgaCrypto.hashFiles("sha512", Ctrl, pt);
};
