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
 * @param {number} desired
 * @param {boolean} inherit
 * @param {number} prsid
 * @return {number}
 */
api.OpenProcess = function(desired, inherit, prsid){};
/**
 * @param {number} hdl
 * @param {number} msec
 * @return {number}
 */
api.WaitForSingleObject = function(hdl, msec){};
/**
 * @param {number} hdl
 */
api.CloseHandle = function(hdl){};
/**
 * @param {string} nm
 * @return {ADOStream}
 */
api.CreateObject = function(nm){};
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
 * @param {TablacusControl=} Ctrl
 * @param {Object=} pt
 * @return {FolderView}
 */
var GetFolderView = function(Ctrl, pt){};
/**
 * @param {string} fil
 * @return {ADOStream}
 */
var OpenAdodbFromTextFile = function(fil){};
/**
 * @param {string} fn
 * @param {DialogOptions} opt
 * @return {TablacusControl}
 */
var ShowDialog = function(fn, opt){};
/**
 * @param {Window|Element} w
 * @param {string} nm
 * @param {function(Event=):void} fn
 */
var AddEventEx = function(w, nm, fn){};
/**
 * @param {string} path
 */
var importScript = function(path){};
/**
 * @return {XMLHttpRequest}
 */
var createHttpRequest = function(){};
