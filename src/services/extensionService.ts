import * as vscode from "vscode";
import { StatusBarService } from "./statusBarService";
import { LoggingService } from "./loggingService";
import { ReactEmailService } from "./reactEmailService";
import { PreviewPanelService } from "./previewPanelService";

export class ExtensionService {
  private reactMailService = new ReactEmailService();
  private statusBarService = new StatusBarService();

  async activate(context: vscode.ExtensionContext) {
    PreviewPanelService.init(context);
    this.reactMailService.initExtension(context);
    this.registerCommands(context);
    LoggingService.log("React Email is now active!");
  }

  deactivate() {}

  private registerCommands(context: vscode.ExtensionContext) {
    const disposables: vscode.Disposable[] = [];

    disposables.push(
      vscode.commands.registerCommand("react-email.preview", async () => {
        PreviewPanelService.showOrCreatePanel();
        this.reactMailService.renderActiveFile();
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
