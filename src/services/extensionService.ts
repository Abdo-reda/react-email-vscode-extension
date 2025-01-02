import * as vscode from "vscode";
import { LoggingService } from "./loggingService";
import { ReactEmailService } from "./reactEmailService";
import { PreviewPanelService } from "./previewPanelService";
import { IExtensionConfiguration } from "../interfaces/extensionConfigurationInterface";
import { ExtensionConfigurations, PACKAGE_CONFIGURATION_MAP } from "../constants/configurationEnum";
import { getConfiguration, isConfigurationChanged, updateConfiguration } from "../utilities/vscodeUtilities";
import { DEFAULT_CONFIGURATION, ExtensionConfiguration } from "../constants/configurationConstants";
import { PackagesEnum } from "../constants/packagesEnum";

export class ExtensionService {
  private reactMailService = new ReactEmailService();
  private extensionConfiguration: IExtensionConfiguration = new ExtensionConfiguration();

  async activate(context: vscode.ExtensionContext) {
    PreviewPanelService.init(context);
    this.setupConfigurations();
    this.registerCommands(context);
    this.reactMailService.initExtension(context, this.extensionConfiguration);
    LoggingService.log("React Email is now active!");
  }

  deactivate() {
    LoggingService.log("React Email is now deactivate!");
  }

  private setupConfigurations() {
    LoggingService.log("Setting up Extension Configuration.");

    this.extensionConfiguration = {
      renderApproach: getConfiguration(ExtensionConfigurations.RENDER_APPROACH, DEFAULT_CONFIGURATION.renderApproach),
      dependencies: getConfiguration(ExtensionConfigurations.DEPENDENCIES, DEFAULT_CONFIGURATION.dependencies),
      renderOn: getConfiguration(ExtensionConfigurations.RENDER_ON, DEFAULT_CONFIGURATION.renderOn),
      packageManager: getConfiguration(ExtensionConfigurations.PACKAGE_MANAGER, DEFAULT_CONFIGURATION.packageManager),
      packages: {
        directory: getConfiguration(ExtensionConfigurations.DIRECTORY, DEFAULT_CONFIGURATION.packages.directory),
        reactEmailRenderVersion: getConfiguration(
          ExtensionConfigurations.REACT_EMAIL_RENDER_VERSION,
          DEFAULT_CONFIGURATION.packages.reactEmailRenderVersion
        ),
        reactEmailComponentsVersion: getConfiguration(
          ExtensionConfigurations.REACT_EMAIL_COMPONENTS_VERSION,
          DEFAULT_CONFIGURATION.packages.reactEmailComponentsVersion
        ),
        reactVersion: getConfiguration(ExtensionConfigurations.REACT_VERSION, DEFAULT_CONFIGURATION.packages.reactVersion),
        reactDomVersion: getConfiguration(
          ExtensionConfigurations.REACT_DOM_VERSION,
          DEFAULT_CONFIGURATION.packages.reactDomVersion
        ),
      },
      server: {
        port: getConfiguration(ExtensionConfigurations.SERVER_PORT, DEFAULT_CONFIGURATION.server.port),
        terminalVisibility: getConfiguration(
          ExtensionConfigurations.SERVER_TERMINAL_VISIBILITY,
          DEFAULT_CONFIGURATION.server.terminalVisibility
        ),
        terminalColor: getConfiguration(
          ExtensionConfigurations.SERVER_TERMINAL_COLOR,
          DEFAULT_CONFIGURATION.server.terminalColor
        ),
      },
    };

    //TODO: there is an issue with this !!!!
    return vscode.workspace.onDidChangeConfiguration((event) => {
      // if (isConfigurationChanged(event, ExtensionConfigurations.REACT_EMAIL_VERSION)) {
      //   this.reactEmailVersion = getConfiguration<string>(ExtensionConfigurations.REACT_EMAIL_VERSION) ?? "latest";
      //   LoggingService.log(`${ExtensionConfigurations.REACT_EMAIL_VERSION} Configuration Changed ${this.reactEmailVersion}!`);
      // }

      if (isConfigurationChanged(event, ExtensionConfigurations.PACKAGE_MANAGER)) {
        this.extensionConfiguration.packageManager = getConfiguration(
          ExtensionConfigurations.PACKAGE_MANAGER,
          this.extensionConfiguration.packageManager
        );
        LoggingService.log(
          `${ExtensionConfigurations.PACKAGE_MANAGER} Configuration Changed ${this.extensionConfiguration.packageManager}!`
        );
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
    const selectedPackage = (await vscode.window.showQuickPick(
      [PackagesEnum.REACT, PackagesEnum.REACT_DOM, PackagesEnum.REACT_EMAIL_COMPONENTS, PackagesEnum.REACT_EMAIL_RENDER],
      {
        placeHolder: `Selected Package`,
        title: "Step 1: Select the Package to Update",
      }
    )) as PackagesEnum;

    if (!selectedPackage) return;

    const currentVersion = this.getCurrentVisionOfPackage(selectedPackage);
    const verisons = await this.reactMailService.getPackageVersions(selectedPackage);
    const selectedVersion = await vscode.window.showQuickPick(["latest", ...verisons], {
      placeHolder: `Current version: ${currentVersion}`,
      title: "Step 2: Select the version to use",
    });

    if (!selectedVersion) return;

    //TODO: should this be based on the workspace
    await updateConfiguration(
      PACKAGE_CONFIGURATION_MAP.get(selectedPackage)!,
      selectedVersion,
      vscode.ConfigurationTarget.Workspace
    );
    LoggingService.log(`Updated ${selectedPackage} version to ${selectedVersion}`);
  }

  private getCurrentVisionOfPackage(packageName: PackagesEnum): string {
    switch (packageName) {
      case PackagesEnum.REACT:
        return this.extensionConfiguration.packages.reactVersion;
      case PackagesEnum.REACT_DOM:
        return this.extensionConfiguration.packages.reactDomVersion;
      case PackagesEnum.REACT_EMAIL_COMPONENTS:
        return this.extensionConfiguration.packages.reactEmailComponentsVersion;
      case PackagesEnum.REACT_EMAIL_RENDER:
        return this.extensionConfiguration.packages.reactEmailRenderVersion;
      default:
        return "latest";
    }
  }
}
