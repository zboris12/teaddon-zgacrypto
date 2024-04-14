/** @constructor */
var InputStream = function(){};
/** @type {boolean} */
InputStream.prototype.AtEndOfStream;
/**
 * @return {string}
 */
InputStream.prototype.ReadAll = function(){};

/** @constructor */
var WshScriptExec = function(){};
/** @type {number} */
WshScriptExec.prototype.ExitCode;
/** @type {number} */
WshScriptExec.prototype.ProcessID;
/** @type {number} */
WshScriptExec.prototype.Status;
/** @type {InputStream} */
WshScriptExec.prototype.StdOut;
/** @type {InputStream} */
WshScriptExec.prototype.StdErr;

/** @constructor */
var WshScript = function(){};
/**
 * @param {string} cmd
 * @return {WshScriptExec}
 */
WshScript.prototype.Exec = function(cmd){};

/** @constructor */
var FileSystemObject = function(){};
/**
 * @param {string} path
 * @param {string} name
 * @return {string}
 */
FileSystemObject.prototype.BuildPath = function(path, name){};
/**
 * @param {string} path
 * @return {boolean}
 */
FileSystemObject.prototype.FileExists = function(path){};
/**
 * @param {string} path
 * @return {string}
 */
FileSystemObject.prototype.GetBaseName = function(path){};
/**
 * @param {string} path
 * @return {string}
 */
FileSystemObject.prototype.GetExtensionName = function(path){};
/**
 * @param {string} path
 * @return {FolderItem} //The real type is File.
 */
FileSystemObject.prototype.GetFile = function(path){};
/**
 * @param {string} path
 * @return {string}
 */
FileSystemObject.prototype.GetParentFolderName = function(path){};
/**
 * @param {string} filename
 * @param {number=} iomode // 1: ForReading, 2: ForWriting, 8: ForAppending
 * @param {boolean=} create
 * @param {number=} format
 * @return {TextStream}
 *
 * format:
 *  TristateUseDefault -2: Opens the file by using the system default.
 *  TristateTrue       -1: Opens the file as Unicode.
 *  TristateFalse       0: Opens the file as ASCII.
 */
FileSystemObject.prototype.OpenTextFile = function(filename, iomode, create, format){};

/** @constructor */
var TextStream = function(){};
/** @type {boolean} */
TextStream.prototype.AtEndOfStream;
TextStream.prototype.Close = function(){};
/**
 * @param {number} characters
 * @return {string}
 */
TextStream.prototype.Read = function(characters){};
/**
 * @param {string} str
 */
TextStream.prototype.Write = function(str){};

/** @constructor */
var WinShell = function(){};
/**
 * @param {string} dir
 * @return {Folder}
 */
WinShell.prototype.NameSpace = function(dir){};

/** @constructor */
var Folder = function(){};
/**
 * @param {string} nm
 * @return {FolderItem}
 */
Folder.prototype.ParseName = function(nm){};

/** @constructor */
var FolderItem = function(){};
/** @type {Folder} */
FolderItem.prototype.Parent;
/** @type {string} */
FolderItem.prototype.Path;
/** @type {string} */
FolderItem.prototype.Name;
/** @type {number} */
FolderItem.prototype.Size;
/**
 * @type {boolean}
 * If it is a zip file, the property is alos true.
 */
FolderItem.prototype.IsFolder;

/** @constructor */
var FolderItems = function(){};
/** @type {number} */
FolderItems.prototype.Count;
/**
 * @param {number} idx
 * @return {FolderItem}
 */
FolderItems.prototype.Item = function(idx){};

/** @constructor */
var FolderView = function(){};
/**
 * @return {FolderItems}
 */
FolderView.prototype.SelectedItems = function(){};
/** @type {FolderItem} */
FolderView.prototype.FolderItem;

/**
 * @typedef
 * {{
 *   length: number,
 * }}
 */
var VBytes;
/** @constructor */
var ADOStream = function(){};
/** @type {number} */
ADOStream.prototype.Type;
ADOStream.prototype.Open = function(){};
/**
 * @param {number=} NumChars
 * @return {string}
 */
ADOStream.prototype.ReadText = function(NumChars){};
/**
 * @param {VBytes} byts
 */
ADOStream.prototype.Write = function(byts){};
/**
 * @param {string} fnm
 * @param {number=} opt //1: adSaveCreateNotExist(default), 2: adSaveCreateOverWrite
 */
ADOStream.prototype.SaveToFile = function(fnm, opt){};
ADOStream.prototype.Close = function(){};

/** @const {number} */
var OFN_FILEMUSTEXIST;
/** @constructor */
var CommonDialog = function(){};
/**
 * @return {boolean}
 */
CommonDialog.prototype.ShowOpen = function(){};
/** @type {string} */
CommonDialog.prototype.FileName;
/** @type {string} */
CommonDialog.prototype.Filter;
/** @type {number} */
CommonDialog.prototype.Flags;


