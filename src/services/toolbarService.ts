import * as vscode from "vscode";
import { PreviewPanelCommandEnum } from "../constants/previewPanelCommandEnum";
import { IPanelMessage } from "../interfaces/panelMessageInterface";


//TODO: TOOLBAR
//- different color options to change the background.
//- a text option.
//- a html option.
//- a simple gmail preview option
//- size/zoom (100% so on ..)
//- source code inspector
//- the tab has a loading indicator somewhere (maybe on its bar on the top right)

export class ToolbarService {
	
    handleMessage(message: IPanelMessage<any>) {
        if (message.command === PreviewPanelCommandEnum.INSPECT) {
            this.handleInspect();
        }
    }

    private handleInspect() {
        vscode.commands.executeCommand("workbench.action.toggleDevTools");
    }
}