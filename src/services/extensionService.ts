import * as vscode from "vscode";
import { StatusBarService } from "./statusBarService";
import { LoggingService } from "./loggingService";
import { ReactEmailService } from "./reactEmailService";
import { PreviewPanelService } from "./previewPanelService";
import { IExtensionConfiguration } from "../interfaces/extensionConfigurationInterface";
import { PackageManagerEnum } from "../constants/packageManagerEnum";
import { RenderOnEnum } from "../constants/renderOnEnum";
import { ExtensionConfigurations } from "../constants/configurationEnum";
import { getConfiguration, isConfigurationChanged } from "../utilities/vscodeUtilities";

export class ExtensionService {
  private reactMailService = new ReactEmailService();
  // private statusBarService = new StatusBarService(); //TODO: make it static
  private extensionConfiguration: IExtensionConfiguration = {
    packageManager: PackageManagerEnum.NPM,
    renderOn: RenderOnEnum.ON_SAVE,
    packages: {
      reactEmailRenderVersion: "latest"
    }
  };

  async activate(context: vscode.ExtensionContext) {
    PreviewPanelService.init(context);
    this.setupConfigurations();
    this.registerCommands(context);
    this.reactMailService.initExtension(context, this.extensionConfiguration);
    LoggingService.log("React Email is now active!");
  }

  deactivate() {}

  private setupConfigurations() {

    this.extensionConfiguration = {
      renderOn: getConfiguration<RenderOnEnum>(ExtensionConfigurations.RENDER_ON) ?? RenderOnEnum.ON_SAVE,
      packageManager: getConfiguration<PackageManagerEnum>(ExtensionConfigurations.PACKAGE_MANAGER) ?? PackageManagerEnum.NPM,
      packages: {
        reactEmailRenderVersion: getConfiguration<string>(ExtensionConfigurations.REACT_EMAIL_VERSION) ?? 'latest'
      }
    };

    //TODO: there is an issue with this !!!!
    return vscode.workspace.onDidChangeConfiguration((event) => {
      // if (isConfigurationChanged(event, ExtensionConfigurations.REACT_EMAIL_VERSION)) {
      //   this.reactEmailVersion = getConfiguration<string>(ExtensionConfigurations.REACT_EMAIL_VERSION) ?? "latest";
      //   LoggingService.log(`${ExtensionConfigurations.REACT_EMAIL_VERSION} Configuration Changed ${this.reactEmailVersion}!`);
      // }

      if (isConfigurationChanged(event, ExtensionConfigurations.PACKAGE_MANAGER)) {
        this.extensionConfiguration.packageManager = getConfiguration<PackageManagerEnum>(ExtensionConfigurations.PACKAGE_MANAGER) ?? PackageManagerEnum.NPM;
        LoggingService.log(`${ExtensionConfigurations.PACKAGE_MANAGER} Configuration Changed ${this.extensionConfiguration.packageManager}!`);
      }

      this.reactMailService.updateExtensionConfiguration(this.extensionConfiguration);
    });
  }

  private registerCommands(context: vscode.ExtensionContext) {
    const disposables: vscode.Disposable[] = [];

    disposables.push(
      vscode.commands.registerCommand("react-email.preview", async () => {
        PreviewPanelService.showOrCreatePanel();
        this.reactMailService.renderActiveDocument();
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
