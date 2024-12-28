import * as vscode from "vscode";
import { StatusBarService } from "./statusBarService";
import { LoggingService } from "./loggingService";
import { ReactEmailService } from "./reactEmailService";
import { getWebViewContents } from "../constants/previewWebview";

export class ExtensionService {
  private reactMailService = new ReactEmailService();
  private statusBarService = new StatusBarService();

  async activate(context: vscode.ExtensionContext) {
    this.reactMailService.initExtension(context);
    this.registerCommands(context);
    LoggingService.log("React Email is now active!");
  }

  deactivate() {}

  private createPreviewWebview(context: vscode.ExtensionContext): vscode.WebviewPanel {
    const panel = vscode.window.createWebviewPanel(
      "react-email.server",
      "React Email Server",
      {
        viewColumn: vscode.ViewColumn.Beside,
        preserveFocus: true,
      },
      {
        enableScripts: true,
      }
    );
    panel.webview.html = getWebViewContents(this.reactMailService.renderServerURL);
    panel.webview.onDidReceiveMessage(
      (message) => {
        console.log("--- recieved message", message);
      },
      undefined,
      context.subscriptions
    );
    return panel;
  }

  private registerCommands(context: vscode.ExtensionContext) {
    const disposables: vscode.Disposable[] = [];

    disposables.push(
      vscode.commands.registerCommand("react-email.preview", async () => {
        this.reactMailService.runServer();
        this.createPreviewWebview(context);
      })
    );

    disposables.push(
      vscode.commands.registerCommand("react-email.selectRenderVersion", async () => {
        await this.reactMailService.chooseReactEmailVersion();
      })
    );

    disposables.push(
      vscode.commands.registerCommand("react-email.showServerTerminal", () => {
        this.reactMailService.showServerTerminal();
      })
    );

    disposables.push(
      vscode.commands.registerCommand("react-email._showOutput", () => {
        LoggingService.show();
      })
    );

    context.subscriptions.push(...disposables);
  }
}
