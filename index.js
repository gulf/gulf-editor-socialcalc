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
  , spreadsheetOT = require('ot-socialcalc')
  , SocialCalc = require('socialcalc')

require('./socialcalc_patches')

module.exports = function(socialCalcControl) {
  var doc = new gulf.EditableDocument(new gulf.MemoryAdapter, spreadsheetOT)

  doc.socialCalcControl = socialCalcControl

  doc._setContents = function(newcontent, cb) {
    socialCalcControl.sheet.ParseSheetSave(newcontent)
    socialCalcControl.sheet.ScheduleSheetCommands('recalc', /*saveundo:*/false, /*isRemote:*/false)
    cb()
  }

  doc._change = function(changes, cb) {
    var cmds = spreadsheetOT.serializeEdit(changes)
    socialCalcControl.sheet.ScheduleSheetCommands(cmds, /*saveundo:*/false, /*isRemote:*/true)
    socialCalcControl.editor.StatusCallback['gulf-socialcalc#_onchange'] = { func: (editor, status) => {
      if('cmdend' !== status) return
      delete socialCalcControl.editor.StatusCallback['gulf-socialcalc#_onchange']
      cb()
    } }
  }

  doc._collectChanges = function(cb) {
    // changes are automatically collected
    cb()
  }

  SocialCalc.Callbacks.broadcast = function(type, data) {
    if('execute' !== type) return
    var changes = spreadsheetOT.deserializeEdit(data.cmdstr)
    doc.update(changes)
  }

  return doc
}
