/** @const {string} */
var Addon_Id = "zgacrypto";
/** @type {AddonElement} */
var item = GetAddonElement(Addon_Id);

if(!item.getAttribute("forgeurl")){
	item.setAttribute("MenuExec", 1);
	item.setAttribute("Menu", "Context");
	item.setAttribute("MenuPos", 1);
	item.setAttribute("forgeurl", "https://cdn.jsdelivr.net/npm/node-forge@1.3.1/dist/forge.min.js");
	item.setAttribute("forgepath", BuildPath(te.Data.Installed, "addons", Addon_Id, "forge.min.js"));
	item.setAttribute("algorithm", 1);
	item.setAttribute("encext", "enc");
	item.setAttribute("decext", "-");
}
if(window.Addon == 1){
	importScript(BuildPath(te.Data.Installed, "addons", Addon_Id, "main.js"));
	Addons.ZgaCrypto.init(Addon_Id, item);

}else if(!window.Addon){
	//Config mode.
	importScript(BuildPath(te.Data.Installed, "addons", Addon_Id, "options.js"));
}
