import * as vscode from "vscode";
import { ExtensionService } from "./services/extensionService";

//TODO:
//- make sure script is working

const extensionService = new ExtensionService();

export async function activate(context: vscode.ExtensionContext) {
  extensionService.activate(context);
}

export function deactivate() {
  extensionService.deactivate();
}
