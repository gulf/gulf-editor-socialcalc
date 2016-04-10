// This file was licensed under a CC0 License by Audrey Tang:
// https://creativecommons.org/publicdomain/zero/1.0/legalcode
(function(SocialCalc){
        if(!SocialCalc) throw new Error('Could not find SocialCalc')
        // Already extended?
        if (SocialCalc != null && SocialCalc.OrigDoPositionCalculations) {
          return;
        }
        SocialCalc.OrigDoPositionCalculations = SocialCalc.DoPositionCalculations;
        SocialCalc.DoPositionCalculations = function(){
          SocialCalc.OrigDoPositionCalculations.apply(SocialCalc, arguments);
          if (typeof SocialCalc.Callbacks.broadcast == 'function') {
            SocialCalc.Callbacks.broadcast('ask.ecell');
          }
        };
        SocialCalc.OrigSizeSSDiv = SocialCalc.SizeSSDiv;
        SocialCalc.SizeSSDiv = function(spreadsheet){
          if (!(spreadsheet != null && spreadsheet.parentNode)) {
            return;
          }
          return SocialCalc.OrigSizeSSDiv(spreadsheet);
        };
        SocialCalc.Sheet.prototype.ScheduleSheetCommands = function(){
          return SocialCalc.ScheduleSheetCommands.apply(SocialCalc, [this].concat([].slice.call(arguments)));
        };
        SocialCalc.OrigScheduleSheetCommands = SocialCalc.ScheduleSheetCommands;
        SocialCalc.ScheduleSheetCommands = function(sheet, cmdstr, saveundo, isRemote){
          cmdstr = cmdstr.replace(/\n\n+/g, '\n');
          if (!/\S/.test(cmdstr)) {
            return;
          }
          if (!isRemote && cmdstr !== 'redisplay' && cmdstr !== 'recalc') {
            if ((window.__MULTI__ != null && (window.__MULTI__.rows != null && window.__MULTI__.rows.length)) && /set \w+ formula /.exec(cmdstr)) {
              for (var i=0, len=window.__MULTI__.rows.length; i < len; ++i) {
                var row = window.__MULTI__.rows[i], link = row.link, title = row.title;
                cmdstr = cmdstr.replace(RegExp('\\$' + title + '\\.([A-Z]+[1-9][0-9]*)', 'ig'), "\"" + link.replace('/', '') + "\"!$1");
              }
            }
            if (typeof SocialCalc.Callbacks.broadcast == 'function') {
              SocialCalc.Callbacks.broadcast('execute', {
                cmdstr: cmdstr,
                saveundo: saveundo,
                room: sheet._room
              });
            }
          }
          return SocialCalc.OrigScheduleSheetCommands(sheet, cmdstr, saveundo, isRemote);
        };
        SocialCalc.MoveECell = function(editor, newcell){
          var highlights, cell, f;
          highlights = editor.context.highlights;
          if (editor.ecell) {
            if (editor.ecell.coord === newcell) {
              return newcell;
            }
            if (typeof SocialCalc.Callbacks.broadcast == 'function') {
              SocialCalc.Callbacks.broadcast('ecell', {
                original: editor.ecell.coord,
                ecell: newcell
              });
            }
            cell = SocialCalc.GetEditorCellElement(editor, editor.ecell.row, editor.ecell.col);
            delete highlights[editor.ecell.coord];
            if (editor.range2.hasrange && editor.ecell.row >= editor.range2.top && editor.ecell.row <= editor.range2.bottom && editor.ecell.col >= editor.range2.left && editor.ecell.col <= editor.range2.right) {
              highlights[editor.ecell.coord] = 'range2';
            }
            editor.UpdateCellCSS(cell, editor.ecell.row, editor.ecell.col);
            editor.SetECellHeaders('');
            editor.cellhandles.ShowCellHandles(false);
          } else {
            if (typeof SocialCalc.Callbacks.broadcast == 'function') {
              SocialCalc.Callbacks.broadcast('ecell', {
                ecell: newcell
              });
            }
          }
          newcell = editor.context.cellskip[newcell] || newcell;
          editor.ecell = SocialCalc.coordToCr(newcell);
          editor.ecell.coord = newcell;
          cell = SocialCalc.GetEditorCellElement(editor, editor.ecell.row, editor.ecell.col);
          highlights[newcell] = 'cursor';
          for (f in editor.MoveECellCallback) {
            editor.MoveECellCallback[f](editor);
          }
          editor.UpdateCellCSS(cell, editor.ecell.row, editor.ecell.col);
          editor.SetECellHeaders('selected');
          for (f in editor.StatusCallback) {
            editor.StatusCallback[f].func(editor, 'moveecell', newcell, editor.StatusCallback[f].params);
          }
          if (editor.busy) {
            editor.ensureecell = true;
          } else {
            editor.ensureecell = false;
            editor.EnsureECellVisible();
          }
          return newcell;
        };
}).call(this, 'undefined' !== typeof require? require('socialcalc') : 'undefined' === typeof window? SocialCalc : window.SocialCalc);
