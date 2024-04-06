/**
 * @param {string} forgepath
 */
ZgaCrypto.initCryptoEnv = function(forgepath){
	if(!window.URL.prototype){
		alert("Fix URL for node-forge.");
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
		alert("Load forge.");
		/** @type {ADOStream} */
		var ado = OpenAdodbFromTextFile(forgepath);
		/** @type {string} */
		var s = ado.ReadText();
		ado.Close();
		var sc = new Function(s);
		sc();
	}
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
