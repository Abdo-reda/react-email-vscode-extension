import * as vscode from "vscode";
import { ExtensionService } from "./services/extensionService";

//TODO:
//- make sure script is working
//- configurations changes (subscripe and handler behaviour)
//- react-email-renderer.packages.directory (update the usage of directory)

const extensionService = new ExtensionService();

export async function activate(context: vscode.ExtensionContext) {
  extensionService.activate(context);
}

export function deactivate() {
  extensionService.deactivate();
}
