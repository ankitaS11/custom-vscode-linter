import * as path from 'path';
import * as cp from 'child_process';
 
import * as vscode from 'vscode';
import internal = require('assert');
 
// called when vs code is activated
export function activate(context: vscode.ExtensionContext) {
   let activeEditor = vscode.window.activeTextEditor;
   let timeout: NodeJS.Timer | undefined = undefined;
   const decorationType = vscode.window.createTextEditorDecorationType({
       borderWidth: '0px',
       borderStyle: '', // we don't want any border!
       overviewRulerColor: 'blue',
       overviewRulerLane: vscode.OverviewRulerLane.Right,
       textDecoration: 'wavy underline'
   });
 
   if (activeEditor) {
       triggerUpdateDecorations();
   }
 
   vscode.window.onDidChangeActiveTextEditor(editor => {
       activeEditor = editor;
       if (editor) {
           triggerUpdateDecorations();
       }
   }, null, context.subscriptions);
 
   vscode.workspace.onDidChangeTextDocument(event => {
       if (activeEditor && event.document === activeEditor.document) {
           triggerUpdateDecorations();
       }
   }, null, context.subscriptions);

   vscode.workspace.onDidSaveTextDocument(doLPythonLint, null, context.subscriptions);
 
   function doLPythonLint(textDocument: vscode.TextDocument) {
	   let rangesToDecorate: vscode.DecorationOptions[] = [];
       let compilerOutput = '';
       const command = 'lpyth';
       const filePath = path.parse(textDocument.fileName).dir;

	   const argList = [
		   textDocument.uri.fsPath,
	   ];
       const childProcess = cp.spawn(command, argList, {
           cwd: filePath,
    	});

		if (childProcess.pid) {
           childProcess.stdout.on('data', (data: Buffer) => {
               compilerOutput += data;
           });
           childProcess.stderr.on('end', () => {
			const diag = parseStringToDiagnostics(compilerOutput);
			push_for_decoration(
				Number(diag.start_index),
				Number(diag.end_index),
				diag.hover_message,
				rangesToDecorate
			);
			if (!activeEditor) {
				vscode.window.showInformationMessage("No active editor found");
				return;
			}
			activeEditor.setDecorations(decorationType, rangesToDecorate);
           });
       } else {
		   vscode.window.showErrorMessage("Failed to spawn lpyth");
	   }
   }

   function parseStringToDiagnostics(compilerOutput: string) {
	   let obj = JSON.parse(compilerOutput);
	   const output_dict = {
		   "start_index": obj.params.diagnostics.start_index.toString(),
		   "end_index": obj.params.diagnostics.end_index.toString(),
		   "hover_message": obj.params.diagnostics.hover_message.toString()
	   }
	   return output_dict
   }
 
   function triggerUpdateDecorations() {
	   // This function is not used now...
       if (timeout) {
           clearTimeout(timeout);
           timeout = undefined;
       }
       // timeout = setTimeout(updateDecorations, 500);
   }
 
   function updateDecorations() {
       if (!activeEditor) {
           return;
       }
       // line numbers, strings that have been matched, all details to show as info msg
       let rangesToDecorate: vscode.DecorationOptions[] = [];
       check_ifAssignInsteadOfEquals(rangesToDecorate);
       activeEditor.setDecorations(decorationType, rangesToDecorate);
   }

   function check_ifAssignInsteadOfEquals(rangesToDecorate: vscode.DecorationOptions[]) {
       let regex = /if ?\((\w+[^=!<>\r\n])*=([^=\r\n]*)\)/g;
       let hoverMessage = 'Should be ${match[1]} == ${match[2]} or ${match[1]} === ${match[2]}';
       let popupMessage = '= should be == or === in if-statements: ${errors.join(", ")}';
       genericCheck(regex, hoverMessage, popupMessage, rangesToDecorate);
   }

   function push_for_decoration(start_index: number, end_index: number, hover_message: string, rangesToDecorate: vscode.DecorationOptions[] = []) {
   		if (!activeEditor) return;
   		const startPos = activeEditor.document.positionAt(start_index);
		const endPos = activeEditor.document.positionAt(end_index);
		const decoration = {
			'range': new vscode.Range(startPos, endPos),
			'hoverMessage': hover_message, 
		};
		rangesToDecorate.push(decoration);
	}
 
   function genericCheck(regex: RegExp = /^$/, hoverMessage: string = '', popupMessage: string = '', rangesToDecorate: vscode.DecorationOptions[] = []) {
       if (!activeEditor) {
           return;
       }
       const text = activeEditor.document.getText();
       const regexIdVariable = regex; // e.g. /if ?\(([^=)]*[iI][dD](?!\.)\b) ?[^=<>\r\n]*?\)/g;
       let match = regexIdVariable.exec(text);
       let errors = [];
       let firstLineNumber = null;
       // IF we want to replace regex with a C++ engine, we can use the following:
       // make the ./a.out file return an object which contains:
       // starting index of the match (match.index)
       // length of the match (match[0].length)
       // first match (if applicable) (match[1])
       // second match (if applicable) (match[2])
       // and so on...
       while (match) {
           console.log("match was: ", match);
           errors.push(match[1]);
           if (firstLineNumber == null) {
               firstLineNumber = activeEditor.document.positionAt(match.index).line + 1;
           }
           const startPos = activeEditor.document.positionAt(match.index);
           const endPos = activeEditor.document.positionAt(match.index + match[0].length);
           const decoration = {
               'range': new vscode.Range(startPos, endPos),
               'hoverMessage': hoverMessage.replace(/\$\{match\[1\]\}/g, match[1]).replace(/\$\{match\[2\]\}/g, match[2]) // e.g. `An ID of 0 would evaluate to falsy. Consider: ${match[1]} != null`
           };
           rangesToDecorate.push(decoration);
           // For a sample code:
           // // Ankita Sharma
           // if (2 = 3) {
           //
           // }
           // Output will be:
           // 17 2 10 3 (in order: match.index, match[1], match[0].length, match[2])
 
           // match.index is the "starting index" of the "character" 'i' in if
           // match[0].length is the length of the entire match (if (2 = 3) - till this point only)
           // match[1] is the "matching string" i.e. "2" in the above example
           // match[2] is the "matching string" i.e. "3" in the above example
 
           // Following command is only for debugging
           vscode.window.showInformationMessage(match.index.toString() + " " + match[1].toString() + " " + match[0].length.toString() + " " + match[2].toString());
           match = regexIdVariable.exec(text);
       }
       if (errors.length > 0) {
           // e.g. let popupMessage = `ID of 0 would evaluate to falsy. Consider adding "!= null" for if-statements containing IDs: `;
           vscode.window.showInformationMessage('Line ' + firstLineNumber + ': ' + popupMessage.replace(/\$\{errors.join\(", "\)}/g, errors.join(', '))); // e.g. popupMessage + errors.join(', '));
       }
   }
}