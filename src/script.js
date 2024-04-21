/** @const {Array<string>} */
var ALGORITHMS = ["AES-ECB","AES-CBC","AES-CFB","AES-OFB","AES-CTR","AES-GCM"];
/** @const {string} */
var Addon_Id = "zgacrypto";
/** @type {AddonElement} */
var item = GetAddonElement(Addon_Id);

if(!item.getAttribute("forgepath")){
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
	Addons.ZgaCrypto.init(Addon_Id, item, ALGORITHMS);

}else if(!window.Addon){
//Config mode.
	/**
	 * @param {string} pid
	 * @param {string} tagnm
	 * @param {function(Element):boolean} chkfn
	 */
	function removeElement(pid, tagnm, chkfn){
		/** @type {NodeList<!Element>} */
		var eles = document.getElementById(pid).getElementsByTagName(tagnm);
		/** @type {number} */
		var i = 0;
		while(i < eles.length){
			if(chkfn(eles[i])){
				eles[i].parentNode.removeChild(eles[i]);
				break;
			}
			i++;
		}
	}

	removeElement("panel7", "label", function(a_ele){
		return a_ele.innerText == "Name";
	});
	removeElement("panel7", "input", function(a_ele){
		return a_ele.name == "MenuName";
	});
	/** @type {ADOStream} */
	var ado = OpenAdodbFromTextFile(BuildPath("addons", Addon_Id, "options.html"), "utf-8");
	/** @type {string} */
	var html = ado.ReadText();
	ado.Close();

	/** @type {string} */
	var opts = "";
	ALGORITHMS.forEach(function(a_algo, a_idx){
		opts += '<option value="' + a_idx + '">' + a_algo + '</option>';
	});
	html = html.replace("{algorithms}", opts);
	SetTabContents(0, "General", html);

	/** @type {Element} */
	var div = document.getElementById("zgaDsrt").nextElementSibling;
	if(item.getAttribute("secrets")){
		/** @type {Element} */
		var btn = div.getElementsByTagName("input")[0];
		AddEventEx(btn, "click", function(){
			item.setAttribute("secrets", "");
			div.style.display = "none";
		});
	}else{
		div.style.display = "none";
	}
}
