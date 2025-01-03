import * as vscode from "vscode";
import { LoggingService } from "./loggingService";
import { ReactEmailService } from "./reactEmailService";
import { PreviewPanelService } from "./previewPanelService";
import { ExtensionConfigurations, PACKAGE_CONFIGURATION_MAP } from "../constants/configurationEnum";
import { getConfiguration, isConfigurationChanged, updateConfiguration } from "../utilities/vscodeUtilities";
import { ExtensionConfigurationService } from "./extensionConfigurationService";
import { PackagesEnum } from "../constants/packagesEnum";
import { IExtensionConfigurationService } from "../interfaces/extensionConfigurationServiceInterface";
import { StatusBarService } from "./statusBarService";

export class ExtensionService {
  private reactMailService = new ReactEmailService();
  private extensionConfiguration: IExtensionConfigurationService = new ExtensionConfigurationService();

  async activate(context: vscode.ExtensionContext) {
    PreviewPanelService.init(context);
    StatusBarService.init(context);
    this.setupConfigurations();
    this.registerCommands(context);
    this.reactMailService.initExtension(context, this.extensionConfiguration);
    LoggingService.log("React Email is now active!");
  }

  deactivate() {
    LoggingService.log("React Email is now deactivated!");
  }

  private setupConfigurations() {
    LoggingService.log("Setting up Extension Configuration.");
    this.extensionConfiguration.loadConfiguration();

    //TODO: there is an issue with this !!!!
    return vscode.workspace.onDidChangeConfiguration((event) => {
      // if (isConfigurationChanged(event, ExtensionConfigurations.REACT_EMAIL_VERSION)) {
      //   this.reactEmailVersion = getConfiguration<string>(ExtensionConfigurations.REACT_EMAIL_VERSION) ?? "latest";
      //   LoggingService.log(`${ExtensionConfigurations.REACT_EMAIL_VERSION} Configuration Changed ${this.reactEmailVersion}!`);
      // }

      if (isConfigurationChanged(event, ExtensionConfigurations.PACKAGE_MANAGER)) {
        this.extensionConfiguration.packageManager = getConfiguration(ExtensionConfigurations.PACKAGE_MANAGER, this.extensionConfiguration.packageManager);
        LoggingService.log(`${ExtensionConfigurations.PACKAGE_MANAGER} Configuration Changed ${this.extensionConfiguration.packageManager}!`);
      }
    });
  }

  private registerCommands(context: vscode.ExtensionContext) {
    LoggingService.log("Registering Extension Commands.");
    const disposables: vscode.Disposable[] = [];

    disposables.push(
      vscode.commands.registerCommand("react-email.preview", async () => {
        PreviewPanelService.showOrCreatePanel();
        this.reactMailService.renderActiveDocument();
      })
    );

    disposables.push(
      vscode.commands.registerCommand("react-email.selectPackageVersion", async () => {
        this.selectPackageVersion();
      })
    );

    // disposables.push(
    //   vscode.commands.registerCommand("react-email.showServerTerminal", () => {
    //     // this.reactMailService.showTerminalServer();
    //   })
    // );

    disposables.push(
      vscode.commands.registerCommand("react-email._showOutput", () => {
        LoggingService.show();
      })
    );

    context.subscriptions.push(...disposables);
  }

  private async selectPackageVersion() {
    const selectedPackage = (await vscode.window.showQuickPick([PackagesEnum.REACT, PackagesEnum.REACT_DOM, PackagesEnum.REACT_EMAIL_COMPONENTS, PackagesEnum.REACT_EMAIL_RENDER], {
      placeHolder: `Selected Package`,
      title: "Step 1: Select the Package to Update",
    })) as PackagesEnum;

    if (!selectedPackage) return;

    const currentVersion = this.extensionConfiguration.getCurrentVisionOfPackage(selectedPackage);
    const verisons = await this.reactMailService.getPackageVersions(selectedPackage);
    const selectedVersion = await vscode.window.showQuickPick(["latest", ...verisons], {
      placeHolder: `Current version: ${currentVersion}`,
      title: "Step 2: Select the version to use",
    });

    if (!selectedVersion) return;

    //TODO: should this be based on the workspace
    await updateConfiguration(PACKAGE_CONFIGURATION_MAP.get(selectedPackage)!, selectedVersion, vscode.ConfigurationTarget.Workspace);
    LoggingService.log(`Updated ${selectedPackage} version to ${selectedVersion}`);
  }
}
