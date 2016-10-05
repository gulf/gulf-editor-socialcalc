# gulf-editor-socialcalc
[Gulf](https://github.com/gulf/gulf) bindings for the [socialcalc](https://npmjs.org/package/socialcalc) spreadsheet editor.
It utilizes the [ot-socialcalc](https://github.com/marcelklehr/ot-socialcalc) OT type.

 * Compatible with gulf v5 only (For gulf v4, you may find v0.1.x to work.)

## Install

```
npm install --save gulf gulf-editor-codemirror ot-socialcalc
```

## Usage

```js
const gulf = require('gulf')
const socialcalcOT = require('ot-socialcalc')
const SocialcalcDocument = require('gulf-editor-socialcalc')

var doc = new SocialcalcDocument({
  storageAdapter: new gulf.MemoryAdapter
, ottype: socialcalcOT
, editorInstance: socialcalcControl
})

masterStream.pipe(doc.masterLink()).pipe(masterStream)
```

## API
### class CodemirrorDocument({editorInstance:SocialcalcControl, ...}) extends gulf.EditableDocument
  * `editorInstance` -- a SocialcalcControl instance to be wired up with gulf
  * `storageAdapter` -- a gulf storage adapteir
  * `ottype` -- the ottype to use, this will usually be `ot-socialcalc` from npm.

## Legal
(c) 2016 by Marcel Klehr

Mozilla Public License 2.0

`socialcalc_patches.js` is licensed under CC0 by Audrey Tang.
