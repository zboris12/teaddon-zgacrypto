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

/** @type {WshScript} */
var wsh;
/** @type {FileSystemObject} */
var fso;
/** @type {WinShell} */
var sha;

/**
 * @param {Object=} Ctrl
 * @param {Object=} pt
 * @return {FolderView}
 */
var GetFolderView = function(Ctrl, pt){};

/**
 * @param {string} fil
 * @return {ADOStream}
 */
var OpenAdodbFromTextFile = function(fil){};
