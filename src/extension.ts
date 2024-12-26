import * as vscode from 'vscode';
import { ExtensionService } from "./services/extensionService";

//---------- Simple overview logic
	//- show an icon on the top right next to the split right editor when file is a .tsx/jsx or whatever the language is.
	//- when icon is clicked it runs a command.
	//- preview command is simple. it opens a tab on the right.
	//- the tab has a loading indicator somewhere (maybe on its bar on the top right)
	//- the tab shows a preview/render of the output of the render method.
	//- the tab has a text option.
	//- the tab has color picker options to change the background.
	//- the tab has a simple gmail preview option

//--- I could use pattern for the verison setting. ()

const extensionService = new ExtensionService();

export async function activate(context: vscode.ExtensionContext) {
	extensionService.activate(context);
}

export function deactivate() {
	extensionService.deactivate();
}
