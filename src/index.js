/**
 * gulf binding for SocialCalc spreadsheet editor (using ot-socialcalc)
 * Copyright (C) 2015 Marcel Klehr <mklehr@gmx.net>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
var gulf = require('gulf')
  , SocialCalc = require('socialcalc')

require('./socialcalc_patches')

class SocialcalcDocument extends gulf.EditableDocument {
  constructor(opts) {
    super(opts)
    if (!opts.editorInstance) throw new Error('No SocialCalc instance was passed')
    this.socialcalcControl = opts.editorInstance

    SocialCalc.Callbacks.broadcast = (type, data) => {
      if('execute' !== type) return
      var changes = this.ottype.deserializeEdit(data.cmdstr)
      this.submitChange(changes)
    }
  }

  close() {
    super.close()
    SocialCalc.Callbacks.broadcast = () => {}
  }
  
  _setContent(newcontent) {
    socialCalcControl.sheet.ParseSheetSave(newcontent)
    socialCalcControl.sheet.ScheduleSheetCommands('recalc', /*saveundo:*/false, /*isRemote:*/false)
    return Promise.resolve()
  }

  _onChange(changes) {
    var editor = socialCalcControl.editor
    
    // Remember old selection
    var oldSel = editor.range.hasrange && SocialCalc.crToCoord(editor.range.left, editor.range.top)+
                      ":"+SocialCalc.crToCoord(editor.range.right, editor.range.bottom)
      , oldECell = editor.ecell.coord
    
    // Apply changes
    var cmds = this.ottype.serializeEdit(changes)
      , cb
      , promise = new Promise((resolve) => cb = resolve)
    
    socialCalcControl.sheet.ScheduleSheetCommands(cmds, /*saveundo:*/false, /*isRemote:*/true)
    socialCalcControl.editor.StatusCallback['gulf-editor-socialcalc#_onChange'] = {
      func: (editor, status) => {
        if('cmdend' !== status) return
        delete socialCalcControl.editor.StatusCallback['gulf-editor-socialcalc#_onChange']
        // commands exectuted! 
        cb()
      }
    }

    return promise
    .then(() => {
        // Restore transformed selection
        var newECell = this.ottype.transformCursor(oldECell, changes)
        editor.MoveECell(newECell)
        
        var newSel = this.ottype.transformCursor(oldSel, changes)
          , newSelSplit = newSel.split(':')
        editor.RangeAnchor(newSelSplit[0])
        editor.RangeExtend(newSelSplit[1])
    })
  }

  _onBeforeChange() {
    // changes are automatically collected
    return Promise.resolve()
  }
}

module.exports = SocialcalcDocument
