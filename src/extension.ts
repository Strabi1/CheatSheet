
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export function activate(context: vscode.ExtensionContext) {
	const cheatSheetFileName = 'cheatSheet.md'
	const notesFileName = 'cheatSheetNotes.log'

	let statusBarReadCheatSheet = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 3);
	statusBarReadCheatSheet.text =  `$(book) Read`;
	statusBarReadCheatSheet.tooltip = 'Read Cheat Sheet';
	statusBarReadCheatSheet.command = 'cheatsheet.readCheatSheet';
	statusBarReadCheatSheet.show();
	context.subscriptions.push(statusBarReadCheatSheet);

	let statusBarWriteCheatSheet = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 2);
	statusBarWriteCheatSheet.text =  `$(pencil) Write`;
	statusBarWriteCheatSheet.tooltip = 'Write Cheat Sheet';
	statusBarWriteCheatSheet.command = 'cheatsheet.writeCheatSheet';
	statusBarWriteCheatSheet.show();
	context.subscriptions.push(statusBarWriteCheatSheet);

	let statusBarOpenNotes = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 2);
	statusBarOpenNotes.text =  `$(note) Notes`;
	statusBarOpenNotes.tooltip = 'Open notes';
	statusBarOpenNotes.command = 'cheatsheet.openNotes';
	statusBarOpenNotes.show();
	context.subscriptions.push(statusBarOpenNotes);

	context.subscriptions.push(
		vscode.commands.registerCommand('cheatsheet.readCheatSheet', async() => {
			await openDocument(cheatSheetFileName, true, false);
		}),
		
		vscode.commands.registerCommand('cheatsheet.writeCheatSheet', async() => {
			await openDocument(cheatSheetFileName, true, true);
		}),

		vscode.commands.registerCommand('cheatsheet.changeCheatSheetFolder', async() => {
			changeCheatSheetFolder();
		}),

		vscode.commands.registerCommand('cheatsheet.openNotes', async() => {
			await openDocument(notesFileName, false);
		})
	);

	async function openDocument(filename: string, isMd: boolean, mdPreview: boolean = false) {

		let filePath = vscode.workspace.getConfiguration('cheatsheet').get('cheatSheetFolder');
		
		if(!filePath) {
			await changeCheatSheetFolder();
			await delay(100);
			filePath = vscode.workspace.getConfiguration('cheatsheet').get('cheatSheetFolder');
		}

		await delay(100);

		if(!filePath)
			return;

		const fileWithPath = path.join(String(filePath), filename);

		if(!fs.existsSync(fileWithPath)) {
			try {
				fs.writeFileSync(fileWithPath, '');
			} catch (err: any) {
				vscode.window.showErrorMessage(`Cannot create ${filename} file. Errorcode: ${err}`);
			}
		}

		if(!isMd) {
			const now = new Date();
			const dateStr = now.toLocaleDateString('hu-HU');

			try {
				const file = fs.readFileSync(fileWithPath);
				if(!file.includes(dateStr)) {
					fs.appendFileSync(fileWithPath, file.length ? os.EOL+os.EOL : os.EOL);
					fs.appendFileSync(fileWithPath, `[${dateStr}]`);
					fs.appendFileSync(fileWithPath, os.EOL);
				}
			} catch {}
		}

		const document = await vscode.workspace.openTextDocument(vscode.Uri.parse("file:"+fileWithPath));
		const editor = await vscode.window.showTextDocument(document, {preview: false, viewColumn: 1, })

		const lastLine = document.lineAt(document.lineCount - 1);
		const range = new vscode.Range(lastLine.range.end, lastLine.range.end);
		editor.selection = new vscode.Selection(range.start, range.end);
		editor.revealRange(range, vscode.TextEditorRevealType.InCenter);

		if(isMd) {
			try {
				if(mdPreview)
					await vscode.commands.executeCommand('markdown.showPreviewToSide');
				else
					await vscode.commands.executeCommand('markdown.showPreview');
			} catch {}
		}
	}

	async function changeCheatSheetFolder() {
		const uris = await vscode.window.showOpenDialog({
			canSelectFiles: false,
			canSelectFolders: true,
			canSelectMany: false,
			openLabel: 'Select cheate sheet folder',
		});
		
		if (uris && uris[0]) {
			let config = vscode.workspace.getConfiguration('cheatsheet');
			config.update('cheatSheetFolder', uris[0].fsPath, vscode.ConfigurationTarget.Global);
		}
	}

	function delay(milliseconds: number): Promise<void> {
		return new Promise(resolve => setTimeout(resolve, milliseconds));
	}
}

export function deactivate() {}
