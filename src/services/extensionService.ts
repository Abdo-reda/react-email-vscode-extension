import * as vscode from "vscode";
import { StatusBarService } from "./statusBarService";
import { LoggingService } from "./loggingService";
import { ReactEmailService } from "./reactEmailService";
import { getWebViewContents } from "../constants/previewWebviewConstant";

export class ExtensionService {
  private reactMailService = new ReactEmailService();
  private statusBarService = new StatusBarService();

  async activate(context: vscode.ExtensionContext) {
    this.reactMailService.initExtension(context);
    this.registerCommands(context);
    LoggingService.log("React Email is now active!");
  }

  deactivate() {}

  private createPreviewWebview(context: vscode.ExtensionContext, htmlContent: string, textContent: string): vscode.WebviewPanel {
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
    // panel.webview.html = getWebViewContents();
    // panel.webview.html = htmlContent;
    panel.webview.html = textContent;
    panel.webview.onDidReceiveMessage(
      (message) => {
        // console.log("--- recieved message", message);
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
        const renderOutput = this.reactMailService.renderEmail();
        this.createPreviewWebview(context, renderOutput.html, renderOutput.text);
      })
    );

    disposables.push(
      vscode.commands.registerCommand("react-email.selectRenderVersion", async () => {
        await this.reactMailService.chooseReactEmailVersion();
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
