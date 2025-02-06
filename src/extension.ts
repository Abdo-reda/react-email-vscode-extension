import * as vscode from "vscode";
import { ExtensionService } from "./services/extensionService";

//TODO:
//- make sure script is working
//- custom icons
//- preview panel toolbar
//- react-email-renderer.packages.directory (update the usage of directory)

//---- Tab feature:
//- the tab icon is react email maybe ..
//- the tab has a toolbar:
//- color picker options to change the background.
//- a simple gmail preview option
//- a text option.
//- size/zoom (100% so on ..)
//- source code viewer
//- source code inspector
//- the tab has a loading indicator somewhere (maybe on its bar on the top right)
//- the tab shows a preview/render of the output of the render method or localhost url

//TODO:
//--- Warnings from npm??

const extensionService = new ExtensionService();

export async function activate(context: vscode.ExtensionContext) {
  extensionService.activate(context);
}

export function deactivate() {
  extensionService.deactivate();
}
