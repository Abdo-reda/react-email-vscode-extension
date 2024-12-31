import * as vscode from "vscode";
import { LoggingService } from "./loggingService";
import { ReactEmailService } from "./reactEmailService";
import { PreviewPanelService } from "./previewPanelService";
import { IExtensionConfiguration } from "../interfaces/extensionConfigurationInterface";
import { PackageManagerEnum } from "../constants/packageManagerEnum";
import { RenderOnEnum } from "../constants/renderOnEnum";
import { ExtensionConfigurations, PACKAGE_CONFIGURATION_MAP } from "../constants/configurationEnum";
import { getConfiguration, isConfigurationChanged, updateConfiguration } from "../utilities/vscodeUtilities";
import { PackagesEnum } from "../constants/packagesEnum";
import { DependenciesEnum } from "../constants/dependenciesEnum";
import { RenderApproachEnum } from "../constants/renderApproachEnum";

export class ExtensionService {
  private reactMailService = new ReactEmailService();
  // private statusBarService = new StatusBarService(); //TODO: make it static
  private extensionConfiguration: IExtensionConfiguration = {
      dependencies: DependenciesEnum.EXTERNAL,
      packageManager: PackageManagerEnum.NPM,
      packages: {
        directory: "extensionUri:",
        reactDomVersion: "latest",
        reactEmailComponentsVersion: "latest",
        reactEmailRenderVersion: "latest",
        reactVersion: "latest",
      },
      renderApproach: RenderApproachEnum.SERVER,
      renderOn: RenderOnEnum.ON_SAVE,
      server: {
        port: 7777,
        terminalColor: "terminal.ansiCyan",
        terminalVisibility: false,
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
    LoggingService.log("Setting up Extension Configuration.");
    // this.extensionConfiguration = {
    //   renderOn: getConfiguration<RenderOnEnum>(ExtensionConfigurations.RENDER_ON) ?? RenderOnEnum.ON_SAVE,
    //   packageManager: getConfiguration<PackageManagerEnum>(ExtensionConfigurations.PACKAGE_MANAGER) ?? PackageManagerEnum.NPM,
    //   packages: {
    //     reactEmailRenderVersion: getConfiguration<string>(ExtensionConfigurations.REACT_EMAIL_RENDER_VERSION) ?? "latest",
    //   },
    // };

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
    const selectedPackage = await vscode.window.showQuickPick(
      [PackagesEnum.REACT, PackagesEnum.REACT_DOM, PackagesEnum.REACT_EMAIL_COMPONENTS, PackagesEnum.REACT_EMAIL_RENDER], {
      placeHolder: `Step 1: Selected Package`,
      title: "Select the Package to Update",
    }) as PackagesEnum;

    if (!selectedPackage) return;

    const verisons = await this.reactMailService.getPackageVersions(selectedPackage);
    const selectedVersion = await vscode.window.showQuickPick(["latest", ...verisons], {
      // placeHolder: `Step 2: Current version: ${this.reactEmailVersion}`, //TODO: fix using a map and getting if from the extensionConfiguration
      title: "Select the version to use",
    });
    
    if (!selectedVersion) return;

    //TODO: fix this, make it more generic
    await updateConfiguration(PACKAGE_CONFIGURATION_MAP.get(selectedPackage)!, selectedVersion, vscode.ConfigurationTarget.Workspace); //TODO: should this be based on the workspace
    LoggingService.log(`Updated ${selectedPackage} version to ${selectedVersion}`);
  }
}
