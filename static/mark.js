//@ts-check

// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
	const vscode = acquireVsCodeApi();

	document.getElementById('add-mark-button').addEventListener('click', () => {
		const notes = document.getElementById('notes').value;
		vscode.postMessage({ type: 'add', value: notes });
	});
	document.getElementById('resolve-mark-button').addEventListener('click', () => {
		vscode.postMessage({ type: 'resolved' });
	});

}());


