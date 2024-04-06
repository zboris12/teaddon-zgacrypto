/**
 * @param {string} bpath
 */
window.test = function(bpath){
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

	try{
		/** @const {!Object<string, Array<string>>} */
		var testsdat = {
			"be.txt": ["/v8AYQBiAGMAZABlAGYAZwBoAGkAagBrAGwAbQBu", "2ff63903df02e12bb55cf95a47a64f5e"],
			"le.txt": ["//5hAGIAYwBkAGUAZgBnAGgAaQBqAGsAbABtAG4A", "0e441ea6d3e964819e6328a4db6153f1"],
			"nobom.txt": ["YWJjZGVmZ2hpamtsbW4=", "0845a5972cd9ad4a46bad66f1253581f"],
			"odd_be.txt": ["/v8AYQBiAGMAZABlAGYAZwBoAGkAagBrAGwAbQBuoQ==", "6050486095a81cf56d9e301fe36bf786"],
			"odd_le.txt": ["//5hAGIAYwBkAGUAZgBnAGgAaQBqAGsAbABtAG4AoA==", "d017a2bc551e89ddc7e7f2394bd332ba"],
			"odd_nobom.txt": ["YWJjZGVmZ2hpamtsbW4y", "d410577fa87e5ea07455c3a1531eb66c"],
		};

		/** @type {string} */
		var wkf = bpath + "test";
		ZgaCrypto.initCryptoEnv(fso.BuildPath(wkf, "forge.min.js"));
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

		/** @type {Date} */
		var stdt = new Date();
		/** @type {FolderItem} */
		var fim = wkfdr.ParseName("bigdata.zip");
		/** @type {ZgaCrypto.BinReader} */
		var rdr = new ZgaCrypto.BinReader(fim);
		/** @type {ZgaCrypto.BinWriter} */
		var wtr = new ZgaCrypto.BinWriter(fim.Path + ".enc");

		
		/** @type {CryptoSecrets} */
		var scs = ZgaCrypto.deriveSecrets("abcd", "1234");
		/** @type {forge.util.ByteBuffer} */
		var key2 = new forge.util.ByteBuffer(scs._key);
		/** @type {forge.cipher.BlockCipher} */
		var cryptor = forge.cipher.createCipher("AES-CBC", key2);
		cryptor.start({iv: scs._iv});

		/**
		 * @param {Uint8Array} a_u8
		 * @param {boolean=} a_final
		 */
		var consume = function(a_u8, a_final){
			if(a_u8){
				/** @type {forge.util.ByteBuffer} */
				var wdat = new forge.util.ByteBuffer(a_u8);
				cryptor.update(wdat);
			}
			if(a_final){
				cryptor.finish();
			}
			/** @type {string} */
			var ret2 = cryptor.output.getBytes();
			/** @type {Uint8Array} */
			var ret3 = Uint8Array.fromRaw(ret2);
			wtr.write(ret3);
		};

		/** @type {Uint8Array} */
		var u8 = rdr.read(500000);
		while(!rdr.isEnd()){
			consume(u8);
			u8 = rdr.read(500000);
		}
		consume(u8, true);
		rdr.close();
		wtr.close();

		/** @type {Date} */
		var eddt = new Date();
		prompt("Test Encryption.", "".concat(eddt - stdt));

		stdt = new Date();
		fim = wkfdr.ParseName("bigdata.zip.enc");
		rdr = new ZgaCrypto.BinReader(fim);
		wtr = new ZgaCrypto.BinWriter(fim.Path + ".dec");

		key2 = new forge.util.ByteBuffer(scs._key);
		cryptor = forge.cipher.createDecipher("AES-CBC", key2);
		cryptor.start({iv: scs._iv});

		u8 = rdr.read(500000);
		while(!rdr.isEnd()){
			consume(u8);
			u8 = rdr.read(500000);
		}
		consume(u8, true);
		rdr.close();
		wtr.close();

		eddt = new Date();
		prompt("Test Decryption.", "".concat(eddt - stdt));

	}catch(ex){
		alert(ex.stack);
	}
}

/* Run the codes below in TE's JScript.
var bp = "Path of the project.";
Addons.ZBUtils.runJsFile(bp + "dist\\script-dev.js");
test(bp);
*/
