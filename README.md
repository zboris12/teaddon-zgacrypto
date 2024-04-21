# zgacrypto
![version](https://img.shields.io/github/package-json/v/zboris12/teaddon-zgacrypto)
![license](https://img.shields.io/github/license/zboris12/teaddon-zgacrypto)
![check status](https://github.com/zboris12/teaddon-zgacrypto/actions/workflows/check.yml/badge.svg)

An addon of [Tablacus Explorer](https://github.com/tablacus/TablacusExplorer) to do encryption and decryption.

PS: __ZGA__ is the abbreviation of my father's name.  
And I use this name to hope the merits from this application will be dedicated to my parents.

## Main features

* Encrypt or decrypt files by [AES](https://en.wikipedia.org/wiki/Advanced_Encryption_Standard) algorithms.
* Calculate files' hash value. Supported algorithms:
  * [MD5](https://en.wikipedia.org/wiki/MD5)
  * [SHA-1](https://en.wikipedia.org/wiki/SHA-1)
  * [SHA-256](https://en.wikipedia.org/wiki/SHA-2)
  * [SHA-512](https://en.wikipedia.org/wiki/SHA-2)

## The Dependencies

* [node-forge](https://github.com/digitalbazaar/forge)  

## How To Install

1. Download released file of [zgacrypto.zip](https://github.com/zboris12/teaddon-zgacrypto/releases)
2. Extract the zip file downloaded to the addon's path of [Tablacus Explorer](https://github.com/tablacus/TablacusExplorer)  
For example:
```
C:\TablacusExplorer\addons\zgacrypto\
```
3. Restart [Tablacus Explorer](https://github.com/tablacus/TablacusExplorer)
4. Click menu: `Tools` :arrow_right: `Add-ons...`
5. Enable zgacrypto in popup window

## How To Use

### From context menu

Just right click the files, and select the operation from context menu.  
![context menu](screenshot-cmenu.png "context menu")

### From tool bar

1. Add action to tool bar and specify `Type` to `Add-ons`.
2. And choose add-ons of zgacrypto from list.  
![toolbar](screenshot-toolbar "toolbar")

## License

This application is available under the
[MIT license](https://opensource.org/licenses/MIT).
