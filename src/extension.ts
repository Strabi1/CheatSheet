
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
	const fileName = 'cheatSheet.md'

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

	context.subscriptions.push(
		vscode.commands.registerCommand('cheatsheet.readCheatSheet', async() => {
			await openCheetSheet(false);
		}),
		
		vscode.commands.registerCommand('cheatsheet.writeCheatSheet', async() => {
			await openCheetSheet(true);
		}),

		vscode.commands.registerCommand('cheatsheet.changeCheatSheetFolder', async() => {
			changeCheatSheetFolder();
		})
	);

	async function openCheetSheet(write: boolean) {

		let filePath = vscode.workspace.getConfiguration('cheatsheet').get('cheatSheetFolder');
		
		while(!filePath) {
			await changeCheatSheetFolder();
			await delay(100);
			filePath = vscode.workspace.getConfiguration('cheatsheet').get('cheatSheetFolder');
		}

		const fileWithPath = path.join(String(filePath), fileName);

		if(!fs.existsSync(fileWithPath)) {
			try {
				fs.writeFileSync(fileWithPath, '');
			} catch (err: any) {
				vscode.window.showErrorMessage(`Cannot create cheatSheet.md file. Errorcode: ${err}`);
			}
		}

		const document = await vscode.workspace.openTextDocument(vscode.Uri.parse("file:"+fileWithPath));
		await vscode.window.showTextDocument(document, {preview: false, viewColumn: 1, })

		try {
			if(write)
				await vscode.commands.executeCommand('markdown.showPreviewToSide');
			else
				await vscode.commands.executeCommand('markdown.showPreview');
		} catch {}
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
