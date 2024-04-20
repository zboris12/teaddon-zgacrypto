/** @const {string} */
var Addon_Id = "zgacrypto";
/** @type {AddonElement} */
var item = GetAddonElement(Addon_Id);
ZgaCrypto.SRCDIR = fso.BuildPath(ZgaCrypto.SRCDIR, Addon_Id);
ZgaCrypto.addon = item;

if(!item.getAttribute("forgepath")){
	item.setAttribute("MenuExec", 1);
	item.setAttribute("Menu", "Context");
	item.setAttribute("MenuPos", 1);
	item.setAttribute("forgepath", fso.BuildPath(ZgaCrypto.SRCDIR, "forge.min.js"));
	item.setAttribute("algorithm", ZgaCrypto.AESCBC);
	item.setAttribute("encext", "enc");
	item.setAttribute("decext", "-");
}
if(window.Addon == 1){
	Addons.ZgaCrypto = {
		"BinReader": ZgaCrypto.BinReader,
		"BinWriter": ZgaCrypto.BinWriter,
		"ProgessBar": ZgaCrypto.ProgessBar,
		"initCryptoEnv": ZgaCrypto.initCryptoEnv,
		"encryptLocal": ZgaCrypto.encryptLocal,
		"decryptLocal": ZgaCrypto.decryptLocal,
		"deriveSecrets": ZgaCrypto.deriveSecrets,
		"cryptString": ZgaCrypto.cryptString,
		"FilesCryptor": ZgaCrypto.FilesCryptor,
		"FilesHasher": ZgaCrypto.FilesHasher,
		"askSecrets": ZgaCrypto.askSecrets,
		"encryptFiles": ZgaCrypto.encryptFiles,
		"decryptFiles": ZgaCrypto.decryptFiles,
		"hashFiles": ZgaCrypto.hashFiles,
	};
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

}else if(!window.Addon){
	//Config mode.
	SetTabContents(0, "Color",document.getElementById("panel" + 7).innerHTML+'<form name="E" id="data1"><table id="T" style="width: 100%"><tr><td>ak47 aaa.</td></tr></table></form>');
	document.getElementById("toolbar").innerHTML = '<span>I am hero.</span>';
}
