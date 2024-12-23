import * as vscode from 'vscode';
import { StatusBarService } from './services/statusBarService';
import { LoggingService } from './services/loggingService';

const statusBarService = new StatusBarService();

export async function activate(context: vscode.ExtensionContext) {

	const previewDisposable = vscode.commands.registerCommand('react-mail.preview', () => {
		console.log('--- preview');
	});

	const showOutputDisposable = vscode.commands.registerCommand('react-mail._showOutput', () => {
		LoggingService.show();
	});
	
	context.subscriptions.push(previewDisposable);
	context.subscriptions.push(showOutputDisposable);

	LoggingService.log('React Mail is now active!');
}


export function deactivate() {}
