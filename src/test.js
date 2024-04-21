ZgaCrypto.SRCDIR = window.zgacpath || "";
ZgaCrypto.ALGORITHMS = ["AES-ECB","AES-CBC","AES-CFB","AES-OFB","AES-CTR","AES-GCM"];

/**
 * @param {number} _typ
 */
window.test = function(_typ){
	/**
	 * @param {FolderItem} fil
	 * @return {string}
	 */
	function md5(fil){
		/** @type {ZgaCrypto.BinReader} */
		var rdr = new ZgaCrypto.BinReader(fil);
		/** @type {forge.md.digest} */
		var md = forge.md.md5.create();
		md.start();
		/** @type {Uint8Array} */
		var u8 = rdr.read(5);
		while(!rdr.isEnd()){
			md.update(u8.toRaw());
			u8 = rdr.read(5);
		}
		if(u8){
			md.update(u8.toRaw());
		}
		rdr.close();
		return md.digest().toHex();
	}
	/**
	 * @param {string} fpath
	 * @param {string} b64dat
	 */
	function wrtf(fpath, b64dat){
		/** @type {ZgaCrypto.BinWriter} */
		var wtr = new ZgaCrypto.BinWriter(fpath);
		/** @type {string} */
		var raw = atob(b64dat);
		/** @type {number} */
		var i = 0;
		while(i < raw.length){
			/** @type {number} */
			var j = i + 5;
			/** @type {Uint8Array} */
			var dat = Uint8Array.fromRaw(raw.substring(i, j));
			wtr.write(dat);
			i = j;
		}
		wtr.close();
	}

	/**
	 * @param {Array<FolderItem>} fiarr
	 * @param {CryptoPwdKey} pwdkey
	 * @param {number} algo
	 * @param {boolean} encflg
	 */
	function cryptfs(fiarr, pwdkey, algo, encflg){
		/** @type {CryptoSecrets} */
		var fscs = ZgaCrypto.deriveSecrets(pwdkey);
		/** @type {ZgaCrypto.FilesCryptor} */
		var fcptr = new ZgaCrypto.FilesCryptor(fiarr, {
			_algorithm: algo,
			_encrypt: encflg,
			_outext: encflg ? undefined : "-",
			_secrets: fscs,
		});
		fcptr.open();
	}

	/**
	 * @constructor
	 * @param {Folder} wkfdr
	 * @extends {ZgaCrypto.ProgessBar}
	 */
	function TestRun(wkfdr){
		this.super();

		/** @private @type {Folder} */
		this.wkfdr = wkfdr;
		/** @private @type {ZgaCrypto.BinReader} */
		this.rdr = null;
		/** @private @type {ZgaCrypto.BinWriter} */
		this.wtr = null;

		/** @private @type {CryptoSecrets} */
		this.scs = ZgaCrypto.deriveSecrets({
			_pwd: "abcd,1234",
		});
		/** @private @type {forge.cipher.BlockCipher} */
		this.cryptor = null;
	}
	TestRun.inherit(ZgaCrypto.ProgessBar);
	/**
	 * @override
	 * @protected
	 */
	TestRun.prototype.dispose = function(){
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
	TestRun.prototype.prepareHdStep = function(){
		/** @type {string} */
		var msg = "";
		/** @type {FolderItem} */
		var fim = null;
		/** @type {forge.util.ByteBuffer} */
		var key2 = null;
		if(this.hdStep == 0){
			fim = this.wkfdr.ParseName("bigdata.zip");
			this.rdr = new ZgaCrypto.BinReader(fim);
			this.wtr = new ZgaCrypto.BinWriter(fim.Path + ".enc");

			key2 = new forge.util.ByteBuffer(this.scs._key);
			this.cryptor = forge.cipher.createCipher("AES-CBC", key2);
			this.cryptor.start({iv: this.scs._iv});

			msg = "Encrypting " + fim.Name;
		}else{
			fim = this.wkfdr.ParseName("bigdata.zip.enc");
			this.rdr = new ZgaCrypto.BinReader(fim);
			this.wtr = new ZgaCrypto.BinWriter(fim.Path + ".dec");

			key2 = new forge.util.ByteBuffer(this.scs._key);
			this.cryptor = forge.cipher.createDecipher("AES-CBC", key2);
			this.cryptor.start({iv: this.scs._iv});

			msg = "Decrypting " + fim.Name;
		}
		this.pgSize = fim.Size;
		this.pos = 0;
		this.stepForward(0);
		return msg;
	};
	/**
	 * @override
	 * @protected
	 */
	TestRun.prototype.step = function(){
		if(!this.cryptor){
			this.hdStepForward();
		}else{
			/** @type {Uint8Array} */
			var u8 = this.rdr.read(500000);
			this.consume(u8, this.rdr.isEnd());
			this.stepForward(500000);
			if(this.rdr.isEnd()){
				this.dispose();
			}
		}
	};
	/**
	 * @private
	 * @param {Uint8Array} a_u8
	 * @param {boolean=} a_final
	 */
	TestRun.prototype.consume = function(a_u8, a_final){
		if(a_u8){
			/** @type {forge.util.ByteBuffer} */
			var wdat = new forge.util.ByteBuffer(a_u8);
			this.cryptor.update(wdat);
		}else if(!a_final){
			return;
		}
		if(a_final){
			this.cryptor.finish();
		}
		/** @type {string} */
		var ret2 = this.cryptor.output.getBytes();
		/** @type {Uint8Array} */
		var ret3 = Uint8Array.fromRaw(ret2);
		this.wtr.write(ret3);
	};

	try{
		/** @type {string} */
		var wkf = fso.BuildPath(fso.GetParentFolderName(ZgaCrypto.SRCDIR), "test");
		if(!ZgaCrypto.initCryptoEnv(fso.BuildPath(wkf, "forge.min.js"))){
			return;
		}

		if(_typ == 1){
			/** @type {string} */
			var ostr = "あいうえお"+String.fromCharCode(0)+String.fromCharCode(1);
			/** @type {string} */
			var rndkey = forge.random.getBytesSync(9);
			/** @type {Uint8Array} */
			var u8enc = ZgaCrypto.encryptLocal(ostr, rndkey);
			/** @type {string} */
			var dstr = ZgaCrypto.decryptLocal(u8enc, rndkey);
			if(ostr != dstr){
				throw new Error("Assert failed to encrypt and decrypt for local.");
			}
			alert("Test local encryption and decryption OK. "+ostr.length+":"+u8enc.length);

			/** @type {CryptoSecrets} */
			var tscs = ZgaCrypto.deriveSecrets({
				_pwd: "abcd,1234",
			});
			[0,1,2,3,4,5].forEach(function(a_algo){
				/** @type {string} */
				var a_encdat = ZgaCrypto.cryptString(true, ostr, tscs, a_algo);
				/** @type {string} */
				var a_decdat = ZgaCrypto.cryptString(false, a_encdat, tscs, a_algo);
				if(ostr != a_decdat){
					throw new Error("Assert failed to encrypt and decrypt for " + ZgaCrypto.ALGORITHMS[a_algo]);
				}
			});
			alert("Test encryption and decryption OK.");

			/** @const {!Object<string, Array<string>>} */
			var testsdat = {
				"be.txt": ["/v8AYQBiAGMAZABlAGYAZwBoAGkAagBrAGwAbQBu", "2ff63903df02e12bb55cf95a47a64f5e"],
				"le.txt": ["//5hAGIAYwBkAGUAZgBnAGgAaQBqAGsAbABtAG4A", "0e441ea6d3e964819e6328a4db6153f1"],
				"nobom.txt": ["YWJjZGVmZ2hpamtsbW4=", "0845a5972cd9ad4a46bad66f1253581f"],
				"odd_be.txt": ["/v8AYQBiAGMAZABlAGYAZwBoAGkAagBrAGwAbQBuoQ==", "6050486095a81cf56d9e301fe36bf786"],
				"odd_le.txt": ["//5hAGIAYwBkAGUAZgBnAGgAaQBqAGsAbABtAG4AoA==", "d017a2bc551e89ddc7e7f2394bd332ba"],
				"odd_nobom.txt": ["YWJjZGVmZ2hpamtsbW4y", "d410577fa87e5ea07455c3a1531eb66c"],
			};

			//Test for write binary.
			Object.keys(testsdat).forEach(function(key){
				wrtf(fso.BuildPath(wkf, key), testsdat[key][0]);
			});

			//Test for read binary.
			/** @type {Folder} */
			var wkfdr = sha.NameSpace(wkf);
			Object.keys(testsdat).forEach(function(key){
				var val = md5(wkfdr.ParseName(key));
				if(val != testsdat[key][1]){
					throw new Error("Assert failed to calculate md5 of " + key);
				}
			});

			alert("Test read and write OK.");

			/** @type {TestRun} */
			var trun = new TestRun(wkfdr);
			trun.open(2);

		}else{
			/** @type {FolderView} */
			var FV = GetFolderView();
			/** @type {FolderItems} */
			var Selected = FV.SelectedItems();
			/** @type {Array<FolderItem>} */
			var fiarr = new Array();
			for(var i=0; i<Selected.Count; i++){
				if(fso.FileExists(Selected.Item(i).Path)){
					fiarr.push(Selected.Item(i));
				}
			}
			if(fiarr.length == 0){
				throw new Error("No files selected.");
			}

			if(_typ == 2 || _typ == 3){
				cryptfs(fiarr, {
					_pwd: "abcd",
					_keyfs: [
						fso.BuildPath(wkf, "key1.jpg"),
						"https://cdn.jsdelivr.net/npm/node-forge@1.3.1/lib/index.min.js"
					],
				}, 0, _typ == 2);

			}else if(_typ == 4){
				/** @type {ZgaCrypto.FilesHasher} */
				var fhsr = new ZgaCrypto.FilesHasher(fiarr, "sha256");
				fhsr.open();

			}else if(_typ == 5 || _typ == 6){
				ZgaCrypto.askSecrets(function(_pwdkey, _algo){
					cryptfs(fiarr, _pwdkey, _algo, _typ == 5);
				}, true, _typ == 5 ? 2 : 1, true);
			}
		}

	}catch(ex){
		alert(ex.stack);
	}
}

/* Run the codes below in TE's JScript.
window.zgacpath = "Path of the project." + "\\dist";
//load js
var jspath = fso.BuildPath(window.zgacpath, "script-dev.js");
importScript(jspath);
//run test
test(1);
*/
