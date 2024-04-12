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
ZgaCrypto.EncryptLocal = function(_dat, _key){
	/** @type {string} */
	var enc = api.CryptProtectData(_dat, _key, true);
	return Uint8Array.fromBstr(enc);
};
/**
 * @param {Uint8Array} _dat
 * @param {string} _key
 * @return {string}
 */
ZgaCrypto.DecryptLocal = function(_dat, _key){
	/** @type {string} */
	var dat = _dat.toBstr();
	/** @type {string} */
	var dec = api.CryptUnprotectData(dat, _key, true);
	return dec;
};
