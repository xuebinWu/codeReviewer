// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executd

let _activeEditor:vscode.TextEditor;
let _storeFile:vscode.Uri;
let _toResolveLine = 0;

export function activate(context: vscode.ExtensionContext) {
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "codeReviewer" is now active!');

	// init store file path
	const workspaceFolders = vscode.workspace.workspaceFolders;
	if (!workspaceFolders) {
		return;
	}
	_storeFile = vscode.Uri.parse('memfs:' + workspaceFolders[0].uri.fsPath + '/codeReviewer.csv');

	context.subscriptions.push(vscode.commands.registerCommand('codeReviewer.codeReviewer', () => {
		// The code you place here will be executed every time your command is executed
		if (vscode.window.activeTextEditor) {
			_activeEditor = vscode.window.activeTextEditor;
		}
		openNewPanel();
	}));
	
	// go to the issues, and solve it
	context.subscriptions.push(vscode.commands.registerCommand('codeReviewer.goResolve', () => {
		if (vscode.window.activeTextEditor) {
			_activeEditor = vscode.window.activeTextEditor;
		}
		openTheFile();
	}));
}

// open add mark panel
function openNewPanel(issueText?:string, startLine?:string|number, endLine?:string|number) {
	const markWebViewPanel = vscode.window.createWebviewPanel(
		'markdown.preview', 'Mark Bad Code',
		{ preserveFocus: false, viewColumn: -2 },
		{ enableCommandUris: true, enableScripts: true, enableFindWidget: true}
	);
	if (!startLine && !endLine) {
		const { start, end } = _activeEditor.selection;
		startLine = start.line;
		endLine = end.line;
	}
	markWebViewPanel.webview.html = _getHtmlForWebview(markWebViewPanel.webview, issueText, startLine, endLine);

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
		if (event.type === 'resolved') {
			updateFile('resolved');
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
		} else {
      storeString += '解决情况,文件路径,开始位置,结束位置,修改意见,日期;\r\n'
    }
		if (type === 'add') {
			const { start, end } = _activeEditor.selection;
			let { fileName } = _activeEditor.document;
			if (vscode.workspace.workspaceFolders) {
				fileName = fileName.replace(vscode.workspace.workspaceFolders[0].uri.fsPath, '');
			}
      const date = (new Date()).toLocaleDateString();
			storeString += `unresolved;,${fileName};,${start.line}-${start.character};,${end.line}-${end.character};,${noteTexts};,${date};\r\n`;
		} else {
			const lineArray = storeString.split(';\r\n');
			lineArray[_toResolveLine] = lineArray[_toResolveLine].replace('unresolved', 'resolved');
			storeString = lineArray.join(';\r\n');
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
		_toResolveLine = _activeEditor.selection.active.line;
		const fileString = Buffer.from(JSON.parse(JSON.stringify(uint8Arr)).data).toString('utf8');
		const lineArray = fileString.split('\n');
		const lineStr = lineArray[_toResolveLine];
		const strArray = lineStr.split(';,');
		// const doc = await vscode.workspace.openTextDocument(vscode.Uri.parse('file:' + strArray[1]));
		// await vscode.window.showTextDocument(doc, { preview: false });
		let filePath = strArray[1];
		if (vscode.workspace.workspaceFolders) {
			filePath = vscode.workspace.workspaceFolders[0].uri.fsPath + filePath;
		}

		if (strArray[0] === 'unresolved') {
			const doc = await vscode.workspace.openTextDocument(vscode.Uri.parse('file:' + filePath));
			await vscode.window.showTextDocument(doc, { preview: false });
			const startChar = strArray[2].split('-');
			const endChar = strArray[3].split('-');
			const start = new vscode.Position(Number(startChar[0]), Number(startChar[1]));
			const end = new vscode.Position(Number(endChar[0]), Number(endChar[1]));
			if (vscode.window.activeTextEditor) {
				_activeEditor = vscode.window.activeTextEditor;
				_activeEditor.revealRange(new vscode.Range(start, end));
			}
			hightlightCodes(start, end);
			openNewPanel(strArray[4], startChar[0], endChar[0]);
		} else if (strArray[0] === 'resolved') {
			// resolved
			// show differents with the previous version
			// vscode.commands.executeCommand('gitlens.diffWithPrevious', vscode.Uri.parse('file:' + filePath));
      // vscode.commands.executeCommand('gitlens.showQuickFileHistory', vscode.Uri.parse('file:' + filePath));
			// vscode.commands.executeCommand('gitlens.showFileHistoryView', vscode.Uri.parse('file:' + filePath));
      vscode.commands.getCommands().then(res => {
        if (res.includes('gitlens.showQuickFileHistory')) {
          vscode.commands.executeCommand('gitlens.showQuickFileHistory', vscode.Uri.parse('file:' + filePath));
        } else {
          toastText('请先安装gitlens插件!');
        }
      })
		}
	});
}

function _getHtmlForWebview(webview: vscode.Webview, issueText?: string, startLine?:string|number, endLine?:string|number) {
	// const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(_extensionUri, 'src', 'mark.js'));
	// const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(_extensionUri, 'src', 'mark.css'));
	const scriptUri = webview.asWebviewUri(vscode.Uri.file(path.resolve(__dirname, '../static/mark.js')));
	const styleResetUri = webview.asWebviewUri(vscode.Uri.file(path.resolve(__dirname, '../static/mark.css')));

	return `<!DOCTYPE html>
		<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Mark Bad Codes</title>
				<link href="${styleResetUri}" rel="stylesheet">
			</head>
			<body>
				<div class="form">
					<div class="marginTop">file: ${_activeEditor.document.fileName}</div>
					<div class="marginTop">position: from line ${startLine} to line ${endLine}</div>
					<div class="marginTop">notes:</div>
					<div>
						<textarea id="notes" maxlength="100" autofocus>${issueText || ''}</textarea>
					</div>
					<div>
						<button class="marginTop" id="add-mark-button" style="display:${issueText ? 'none': 'block'}">Add Issue</button>
						<button class="marginTop" id="resolve-mark-button" style="display:${issueText ? 'block': 'none'}">Resolved</button>
					</div>
				</div>
				<script src="${scriptUri}"></script>
			</body>
		</html>`;
}


// this method is called when your extension is deactivated
export function deactivate() {}
