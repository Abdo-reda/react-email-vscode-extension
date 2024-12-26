import * as vscode from "vscode";
import { StatusBarService } from "./statusBarService";
import { LoggingService } from "./loggingService";
import { ReactMailService } from "./reactMailService";

export class ExtensionService {
  private reactMailService = new ReactMailService();
  private statusBarService = new StatusBarService();

  async activate(context: vscode.ExtensionContext) {
    this.reactMailService.initExtension(context);
    this.registerCommands(context);
    LoggingService.log("react-email is now active!");
  }

  deactivate() {}

  private registerCommands(context: vscode.ExtensionContext) {
    const disposables: vscode.Disposable[] = [];

    disposables.push(
      vscode.commands.registerCommand("react-email.preview", async () => {
        this.reactMailService.runServer();
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
