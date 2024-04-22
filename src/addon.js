/**
 * @param {string} aid
 * @param {AddonElement} item
 * @param {Array<string>} algos
 */
function initAddon(aid, item, algos){
	ZgaCrypto.SRCDIR = BuildPath(te.Data.Installed, "addons", aid);
	ZgaCrypto.addon = item;
	ZgaCrypto.ALGORITHMS = algos;

	/** @type {string} */
	var tenc = GetText("Encrypt...");
	/** @type {string} */
	var tdec = GetText("Decrypt...");
	/** @type {string} */
	var thash = GetText("Calculate Hash");
	//Menu
	if (item.getAttribute("MenuExec")) {
		/** @type {number} */
		var mnupos = api.LowPart(item.getAttribute("MenuPos"));
		AddEvent(item.getAttribute("Menu"), function(Ctrl, hMenu, nPos, Selected, item){
			if (item && item.IsFileSystem) {
				/** @type {number} */
				var mp = mnupos;
				api.InsertMenu(hMenu, mp < 0 ? -1 : mp++, MF_BYPOSITION | MF_SEPARATOR, 0, null);
				api.InsertMenu(hMenu, mp < 0 ? -1 : mp++, MF_BYPOSITION | MF_STRING, ++nPos, tenc);
				ExtraMenuCommand[nPos] = ZgaCrypto.encryptFiles;
				api.InsertMenu(hMenu, mp < 0 ? -1 : mp++, MF_BYPOSITION | MF_STRING, ++nPos, tdec);
				ExtraMenuCommand[nPos] = ZgaCrypto.decryptFiles;

				/** @type {number} */
				var hpmnu = api.CreatePopupMenu();
				api.InsertMenu(hpmnu, -1, MF_BYPOSITION | MF_STRING, ++nPos, "md5");
				ExtraMenuCommand[nPos] = ZgaCrypto.md5Files;
				api.InsertMenu(hpmnu, -1, MF_BYPOSITION | MF_STRING, ++nPos, "sha1");
				ExtraMenuCommand[nPos] = ZgaCrypto.sha1Files;
				api.InsertMenu(hpmnu, -1, MF_BYPOSITION | MF_STRING, ++nPos, "sha256");
				ExtraMenuCommand[nPos] = ZgaCrypto.sha256Files;
				api.InsertMenu(hpmnu, -1, MF_BYPOSITION | MF_STRING, ++nPos, "sha512");
				ExtraMenuCommand[nPos] = ZgaCrypto.sha512Files;
				api.InsertMenu(hMenu, mp < 0 ? -1 : mp++, MF_BYPOSITION | MF_POPUP, hpmnu, thash);

				if(mp >= 0){
					api.InsertMenu(hMenu, mp, MF_BYPOSITION | MF_SEPARATOR, 0, null);
				}
			}
			return nPos;
		});
	}
}

Addons.ZgaCrypto = {
	"BinReader": ZgaCrypto.BinReader,
	"BinWriter": ZgaCrypto.BinWriter,
	"writeTempFile": ZgaCrypto.writeTempFile,
	"ProgessBar": ZgaCrypto.ProgessBar,
	"initCryptoEnv": ZgaCrypto.initCryptoEnv,
	"encryptLocal": ZgaCrypto.encryptLocal,
	"decryptLocal": ZgaCrypto.decryptLocal,
	"deriveSecrets": ZgaCrypto.deriveSecrets,
	"cryptString": ZgaCrypto.cryptString,
	"aesEncString": ZgaCrypto.aesEncString,
	"aesDecString": ZgaCrypto.aesDecString,
	"FilesCryptor": ZgaCrypto.FilesCryptor,
	"FilesHasher": ZgaCrypto.FilesHasher,
	"askSecrets": ZgaCrypto.askSecrets,
	"encryptFiles": ZgaCrypto.encryptFiles,
	"decryptFiles": ZgaCrypto.decryptFiles,
	"hashFiles": ZgaCrypto.hashFiles,
	"init": initAddon,
};

AddTypeEx("Add-ons", "ZgaCrypto_encryptFiles", ZgaCrypto.encryptFiles);
AddTypeEx("Add-ons", "ZgaCrypto_decryptFiles", ZgaCrypto.decryptFiles);
AddTypeEx("Add-ons", "ZgaCrypto_md5Files", ZgaCrypto.md5Files);
AddTypeEx("Add-ons", "ZgaCrypto_sha1Files", ZgaCrypto.sha1Files);
AddTypeEx("Add-ons", "ZgaCrypto_sha256Files", ZgaCrypto.sha256Files);
AddTypeEx("Add-ons", "ZgaCrypto_sha512Files", ZgaCrypto.sha512Files);
