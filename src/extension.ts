import * as vscode from "vscode";
import { ExtensionService } from "./services/extensionService";

//TODO:
//- make sure script is working
//- configurations changes (subscripe and handler behaviour)
//- custom icons
//- status bar icons
//- preview panel toolbar
//- react-email-renderer.packages.directory (update the usage of directory)
//- the tab icon is react email maybe ..

const extensionService = new ExtensionService();

export async function activate(context: vscode.ExtensionContext) {
  extensionService.activate(context);
}

export function deactivate() {
  extensionService.deactivate();
}
