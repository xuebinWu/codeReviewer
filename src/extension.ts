// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executd

let _activeEditor:vscode.TextEditor;
let _storeFile:vscode.Uri;
let _extensionUri:vscode.Uri;
let _fixActiveLine = 0;

export function activate(context: vscode.ExtensionContext) {
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "codeReviewer" is now active!');

	// init global data
	_storeFile = vscode.Uri.parse('memfs:' + context.extensionUri.fsPath + '/storeFile.csv');
	_extensionUri = context.extensionUri;

	context.subscriptions.push(vscode.commands.registerCommand('codeReviewer.codeReviewer', () => {
		// The code you place here will be executed every time your command is executed
		if (vscode.window.activeTextEditor) {
			_activeEditor = vscode.window.activeTextEditor;
		}
		openNewPanel();
	}));
	
	// go to the file, and fix it
	context.subscriptions.push(vscode.commands.registerCommand('codeReviewer.goFix', () => {
		if (vscode.window.activeTextEditor) {
			_activeEditor = vscode.window.activeTextEditor;
		}
		openTheFile();
	}));
}

// open add mark panel
function openNewPanel(markText?:string) {
	const markWebViewPanel = vscode.window.createWebviewPanel('markdown.preview', 'Mark Bad Code',
		{ preserveFocus: false, viewColumn: -2 },
		{ enableCommandUris: true, enableScripts: true, enableFindWidget: true, localResourceRoots: [_extensionUri]
	});
	markWebViewPanel.webview.html = _getHtmlForWebview(markWebViewPanel.webview, markText);

	markWebViewPanel.webview.onDidReceiveMessage(event => {
		// colse the panel first
		markWebViewPanel.dispose();

		if (!_activeEditor) {
			toastText('Unknow activeEditor!');
			return;
		}
		if (event.type === 'add') {
			hightlightCodes();
			updateFile('add', event.value);
			toastText('added successfully!');
			return;
		}
		if (event.type === 'fixed') {
			// console.log('fixed');
			updateFile('fixed');
		}
	});
	
	markWebViewPanel.reveal(-2);
}

// hight light those marked codes
function hightlightCodes(startPos?:vscode.Position, endPos?:vscode.Position) {
	const codeDecorationType = vscode.window.createTextEditorDecorationType({
		backgroundColor: { id: 'codeReviewer.codeBackground' }
	});
	// console.log('startPos, endPos', startPos, endPos);
	if (!startPos || !endPos) {
		const selection = _activeEditor.selection;
		startPos = selection.start;
		endPos = selection.end;
		// console.log('get selection', selection);
	}
	const decoration = { range: new vscode.Range(startPos, endPos), hoverMessage: 'please rewrite those codes' };
	_activeEditor.setDecorations(codeDecorationType, [decoration]);
}

// store data to the file
function updateFile(type:string, noteTexts?:string) {
	let storeString = '';
	// read the file first
	fs.readFile(_storeFile.path, (error, uint8Arr) => {
		if (uint8Arr) {
			storeString = Buffer.from(JSON.parse(JSON.stringify(uint8Arr)).data).toString('utf8');
		}
		if (type === 'add') {
			const { start, end } = _activeEditor.selection;
			const { fileName } = _activeEditor.document;
			storeString += `unresolved;${fileName};${start.line},${start.character};${end.line},${end.character};${noteTexts};\n`;
		} else {
			// fixed
			const lineArray = storeString.split(';\n');
			lineArray[_fixActiveLine] = lineArray[_fixActiveLine].replace('unresolved', 'fixed');
			storeString = lineArray.join(';\n');
		}
		fs.writeFile(_storeFile.path, storeString, error => { error && console.log('write error' + error); });
	});
}

function toastText(text:string) {
	text && vscode.window.showInformationMessage(text);
}

function openTheFile() {
	fs.readFile(_storeFile.path, async (error, uint8Arr) => {
		if (error && error.code === 'ENOENT') {
			return;
		}
		_fixActiveLine = _activeEditor.selection.active.line;
		const fileString = Buffer.from(JSON.parse(JSON.stringify(uint8Arr)).data).toString('utf8');
		const lineArray = fileString.split(';\n');
		const lineStr = lineArray[_fixActiveLine];
		const strArray = lineStr.split(';');
		// open the mark file
		const doc = await vscode.workspace.openTextDocument(vscode.Uri.parse('file:' + strArray[1]));
		await vscode.window.showTextDocument(doc, { preview: false });

		// hight light mark codes
		console.log('strArray[0]', strArray);
		if (strArray[0] === 'unresolved') {
			const startChar = strArray[2].split(',');
			const endChar = strArray[3].split(',');
			const start = new vscode.Position(Number(startChar[0]), Number(startChar[1]));
			const end = new vscode.Position(Number(endChar[0]), Number(endChar[1]));
			hightlightCodes(start, end);
			// const selection = new vscode.Selection(start, end);
			openNewPanel(strArray[4]);
		} else {
			// toastText('aaaaaaaaaa');
			vscode.commands.executeCommand('vscode.diff');
		}
	});
}

function _getHtmlForWebview(webview: vscode.Webview, markText?: string) {
	const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(_extensionUri, 'src', 'mark.js'));
	const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(_extensionUri, 'src', 'mark.css'));

	return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${styleResetUri}" rel="stylesheet">
				<title>Mark Bad Codes</title>
			</head>
			<body>
				<div class="form">
					<div class="marginTop">file path: ${_activeEditor.document.fileName}</div>
					<div></div>
					<div class="marginTop">notes:</div>
					<div>
						<textarea id="notes" maxlength="100">${markText || ''}</textarea>
					</div>
					<div>
						<button class="marginTop" id="add-mark-button" style="display:${markText ? 'none': 'block'}">Add Mark</button>
						<button class="marginTop fixed" id="fixed-mark-button" style="display:${markText ? 'block': 'none'}">Fixed</button>
					</div>
				</div>
				<script src="${scriptUri}"></script>
			</body>
			</html>`;
}


// this method is called when your extension is deactivated
export function deactivate() {}
