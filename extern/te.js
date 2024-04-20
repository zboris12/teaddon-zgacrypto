/** @const {number} */
var SYNCHRONIZE;
/** @const {number} */
var WAIT_TIMEOUT;
/** @const {number} */
var adSaveCreateNotExist;
/** @const {number} */
var adSaveCreateOverWrite;
/** @const {number} */
var adTypeBinary;

var te = {};
te.Data = {};
/** @type {string} */
te.Data.Installed;

/** @type {number} */
window.Addon;
var Addons = {};
/** @type {Array<Function>} */
var ExtraMenuCommand = [];

/**
 * @constructor
 * @extends {Array}
 */
var CteMemory = function(){};
/**
 * @param {boolean} flg
 */
CteMemory.prototype.Free = function(flg){};

var api = {};
/**
 * @param {number} hdl
 */
api.CloseHandle = function(hdl){};
/**
 * @param {string} nm
 * @return {ADOStream|CommonDialog}
 */
api.CreateObject = function(nm){};
/**
 * @param {number|string} num
 * @return {number}
 */
api.LowPart = function(num){};
/**
 * @param {number} desired
 * @param {boolean} inherit
 * @param {number} prsid
 * @return {number}
 */
api.OpenProcess = function(desired, inherit, prsid){};
/**
 * @param {number} nSize
 * @param {string} sFormat
 * @param {...*} data
 * @return {string}
 */
api.sprintf = function(nSize, sFormat, data){};
/**
 * @param {number} hdl
 * @param {number} msec
 * @return {number}
 */
api.WaitForSingleObject = function(hdl, msec){};
/**
 * @param {string} lpFileName
 * @param {?number} dwDesiredAccess
 * @param {?number} dwShareMode
 * @param {?number} lpSecurityAttributes
 * @param {?number} dwCreationDisposition
 * @param {?number} dwFlagsAndAttributes
 * @param {?number} hTemplateFile
 * @return {number}
 */
api.CreateFile = function(lpFileName, dwDesiredAccess, dwShareMode, lpSecurityAttributes, dwCreationDisposition, dwFlagsAndAttributes, hTemplateFile){};
/**
 * @param {number} hFile
 * @param {?number} nNumberOfBytesToRead
 * @return {string} //BSTR
 */
api.ReadFile = function(hFile, nNumberOfBytesToRead){};
/**
 * @param {number} hFile
 * @param {number} lDistanceToMove
 * @param {number} dwMoveMethods
 * @return {number}
 */
api.SetFilePointer = function(hFile, lDistanceToMove, dwMoveMethods){};
/**
 * @param {number} hFile
 * @param {string|CteMemory} data //BSTR
 * @return {boolean}
 */
api.WriteFile = function(hFile, data){};
/**
 * @param {string} type
 * @param {number} size
 * @return {CteMemory<number>}
 */
api.Memory = function(type, size){};
/**
 * @param {string} dat
 * @param {string} key
 * @param {boolean} tostr
 * @return {string} //BSTR
 */
api.CryptProtectData = function(dat, key, tostr){};
/**
 * @param {string} dat //BSTR
 * @param {string} key
 * @param {boolean} tostr
 * @return {string}
 */
api.CryptUnprotectData = function(dat, key, tostr){};
/**
 * @param {null} dmy
 * @param {string} url
 * @param {string} fnm
 * @return {number}
 */
api.URLDownloadToFile = function(dmy, url, fnm){};
/**
 * @return {number}
 */
api.CreatePopupMenu = function(){};
/**
 * @param {number} hMenu
 * @param {number} uPosition
 * @param {number} uFlags
 * @param {number} uIDNewItem
 * @param {?string} lpNewItem
 * @return {boolean}
 */
api.InsertMenu = function(hMenu, uPosition, uFlags, uIDNewItem, lpNewItem){};

/** @type {WshScript} */
var wsh;
/** @type {FileSystemObject} */
var fso;
/** @type {WinShell} */
var sha;
/** @type {Window} */
var MainWindow;

/** @constructor */
var TablacusControl = function(){};
/** @type {Window} */
TablacusControl.prototype.Window;
/**
 * @constructor
 * @extends {Element}
 */
var AddonElement = function(){};
/** @type {boolean} */
AddonElement.prototype.IsFileSystem;

/**
 * @typedef
 * {{
 *    MainWindow: Window,
 *    Modal: boolean,
 *    width: number,
 *    height: number,
 * }}
 */
var DialogOptions;

/**
 * @param {string} nm
 * @param {Function} fn
 */
var AddEvent = function(nm, fn){};
/**
 * @param {Window|Element} w
 * @param {string} nm
 * @param {function(Event=):void} fn
 */
var AddEventEx = function(w, nm, fn){};
/**
 * @param {Document} doc
 */
var ApplyLang = function(doc){};
/**
 * @param {...string} p
 */
var BuildPath = function(p){};
/**
 * @return {XMLHttpRequest}
 */
var createHttpRequest = function(){};
/**
 * @param {string} id
 * @return {AddonElement}
 */
var GetAddonElement = function(id){};
/**
 * @param {TablacusControl=} Ctrl
 * @param {Object=} pt
 * @return {FolderView}
 */
var GetFolderView = function(Ctrl, pt){};
/**
 * @param {string} str
 * @return {string}
 */
var GetText = function(str){};
/**
 * @param {string} path
 */
var importScript = function(path){};
/**
 * @param {string} ft
 * @return {string}
 */
var MakeCommDlgFilter = function(ft){};
/**
 * @param {string} fil
 * @return {ADOStream}
 */
var OpenAdodbFromTextFile = function(fil){};
/**
 * @param {string} evt
 * @param {string} nm
 */
var RunEvent1 = function(evt, nm){};
/**
 * @param {string} fn
 * @param {DialogOptions} opt
 * @return {TablacusControl}
 */
var ShowDialog = function(fn, opt){};
