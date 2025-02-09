import * as vscode from "vscode";
import { LoggingService } from "./loggingService";
import { ReactEmailService } from "./reactEmailService";
import { PreviewPanelService } from "./previewPanelService";
import { ExtensionConfigurations, PACKAGE_CONFIGURATION_MAP } from "../constants/configurationEnum";
import { getRefreshedConfiguration, isConfigurationChanged, updateConfiguration } from "../utilities/vscodeUtilities";
import { ExtensionConfigurationService } from "./extensionConfigurationService";
import { PackagesEnum } from "../constants/packagesEnum";
import { StatusBarService } from "./statusBarService";
import { TerminalService } from "./terminalService";
import { RenderOnEnum } from "../constants/renderOnEnum";

export class ExtensionService {
  private terminalService = new TerminalService();
  private reactMailService = new ReactEmailService();
  private extensionConfiguration = new ExtensionConfigurationService();

  async activate(context: vscode.ExtensionContext) {
    LoggingService.log("React Email is Activating ...");
    this.setupConfigurations();
    this.registerCommands(context);
    this.initServices(context);
    this.setupFileChangesListener(context);
    LoggingService.log("React Email is now active!");
  }

  deactivate() {
    LoggingService.log("React Email is now deactivated!");
  }

  private setupConfigurations() {
    LoggingService.log("Setting up Extension Configuration.");
    this.extensionConfiguration.loadConfiguration();

    return vscode.workspace.onDidChangeConfiguration((event) => {
      if (isConfigurationChanged(event, ExtensionConfigurations.PACKAGE_MANAGER)) {
        this.extensionConfiguration.packageManager = getRefreshedConfiguration(ExtensionConfigurations.PACKAGE_MANAGER, this.extensionConfiguration.packageManager);
        this.reactMailService.switchPackageManagerService(this.extensionConfiguration.packageManager);
        LoggingService.log(`${ExtensionConfigurations.PACKAGE_MANAGER} Configuration Changed ${this.extensionConfiguration.packageManager}!`);
      }

      if (isConfigurationChanged(event, ExtensionConfigurations.DIRECTORY)) {
        this.extensionConfiguration.packages.directory = getRefreshedConfiguration(ExtensionConfigurations.DIRECTORY, this.extensionConfiguration.packages.directory);
        LoggingService.log(`${ExtensionConfigurations.DIRECTORY} Configuration Changed ${this.extensionConfiguration.packages.directory}!`);
      }

      if (isConfigurationChanged(event, ExtensionConfigurations.SERVER_PORT)) {
        this.extensionConfiguration.server.port = getRefreshedConfiguration(ExtensionConfigurations.SERVER_PORT, this.extensionConfiguration.server.port);
        this.terminalService.restart();
        LoggingService.log(`${ExtensionConfigurations.SERVER_PORT} Configuration Changed ${this.extensionConfiguration.server.port}!`);
      }

      if (isConfigurationChanged(event, ExtensionConfigurations.SERVER_TERMINAL_COLOR)) {
        this.extensionConfiguration.server.terminalColor = getRefreshedConfiguration(ExtensionConfigurations.SERVER_TERMINAL_COLOR, this.extensionConfiguration.server.terminalColor);
        this.terminalService.setColor( new vscode.ThemeColor(this.extensionConfiguration.server.terminalColor));
        this.terminalService.restart();
        LoggingService.log(`${ExtensionConfigurations.SERVER_TERMINAL_COLOR} Configuration Changed ${this.extensionConfiguration.server.terminalColor}!`);
      }

      if (isConfigurationChanged(event, ExtensionConfigurations.SERVER_TERMINAL_VISIBLE)) {
        this.extensionConfiguration.server.terminalVisible = getRefreshedConfiguration(ExtensionConfigurations.SERVER_TERMINAL_VISIBLE, this.extensionConfiguration.server.terminalVisible);
        this.terminalService.setVisiblity(this.extensionConfiguration.server.terminalVisible );
        LoggingService.log(`${ExtensionConfigurations.SERVER_TERMINAL_VISIBLE} Configuration Changed ${this.extensionConfiguration.server.terminalVisible}!`);
      }

      if (isConfigurationChanged(event, ExtensionConfigurations.RENDER_ON)) {
        this.extensionConfiguration.renderOn = getRefreshedConfiguration(ExtensionConfigurations.RENDER_ON, this.extensionConfiguration.renderOn);
        LoggingService.log(`${ExtensionConfigurations.RENDER_ON} Configuration Changed ${this.extensionConfiguration.renderOn}!`);
      }

      if (isConfigurationChanged(event, ExtensionConfigurations.REACT_DOM_VERSION)) {
        this.extensionConfiguration.packages.reactDomVersion = getRefreshedConfiguration(ExtensionConfigurations.REACT_DOM_VERSION, this.extensionConfiguration.packages.reactDomVersion);
        this.reactMailService.installProjectPackages();
        LoggingService.log(`${ExtensionConfigurations.REACT_DOM_VERSION} Configuration Changed ${this.extensionConfiguration.packages.reactDomVersion}!`);
      }

      if (isConfigurationChanged(event, ExtensionConfigurations.REACT_VERSION)) {
        this.extensionConfiguration.packages.reactVersion = getRefreshedConfiguration(ExtensionConfigurations.REACT_VERSION, this.extensionConfiguration.packages.reactVersion);
        this.reactMailService.installProjectPackages();
        LoggingService.log(`${ExtensionConfigurations.REACT_VERSION} Configuration Changed ${this.extensionConfiguration.packages.reactVersion}!`);
      }

      if (isConfigurationChanged(event, ExtensionConfigurations.REACT_EMAIL_COMPONENTS_VERSION)) {
        this.extensionConfiguration.packages.reactEmailComponentsVersion = getRefreshedConfiguration(ExtensionConfigurations.REACT_EMAIL_COMPONENTS_VERSION, this.extensionConfiguration.packages.reactEmailComponentsVersion);
        this.reactMailService.installProjectPackages();
        LoggingService.log(`${ExtensionConfigurations.REACT_EMAIL_COMPONENTS_VERSION} Configuration Changed ${this.extensionConfiguration.packages.reactEmailComponentsVersion}!`);
      }

      if (isConfigurationChanged(event, ExtensionConfigurations.REACT_EMAIL_RENDER_VERSION)) {
        this.extensionConfiguration.packages.reactEmailRenderVersion = getRefreshedConfiguration(ExtensionConfigurations.REACT_EMAIL_RENDER_VERSION, this.extensionConfiguration.packages.reactEmailRenderVersion);
        this.reactMailService.installProjectPackages();
        LoggingService.log(`${ExtensionConfigurations.REACT_EMAIL_RENDER_VERSION} Configuration Changed ${this.extensionConfiguration.packages.reactEmailRenderVersion}!`);
      }
    });
  }

  private registerCommands(context: vscode.ExtensionContext) {
    LoggingService.log("Registering Extension Commands.");
    const disposables: vscode.Disposable[] = [];

    disposables.push(
      vscode.commands.registerCommand("react-email-renderer.preview", async () => {
        this.reactMailService.renderActiveDocument();
        PreviewPanelService.showOrCreatePanel();
      })
    );

    disposables.push(
      vscode.commands.registerCommand("react-email-renderer.selectPackageVersion", async () => {
        this.selectPackageVersion();
      })
    );

    disposables.push(
      vscode.commands.registerCommand("react-email-renderer.toggleRenderTerminal", () => {
        this.terminalService.toggleVisibility();
      })
    );

    disposables.push(
      vscode.commands.registerCommand("react-email-renderer.restartRenderProcess", () => {
        this.terminalService.restart();
      })
    );

    disposables.push(
      vscode.commands.registerCommand("react-email-renderer.stopRenderProcess", () => {
        this.terminalService.stop();
      })
    );

    disposables.push(
      vscode.commands.registerCommand("react-email-renderer._showOutput", () => {
        LoggingService.show();
      })
    );

    context.subscriptions.push(...disposables);
  }
  
  private initServices(context: vscode.ExtensionContext) {
    PreviewPanelService.init(context);
    StatusBarService.init(context);
    this.terminalService.init(
      context,
      this.extensionConfiguration.server.terminalVisible,
      new vscode.ThemeIcon("react-email"),
      new vscode.ThemeColor(this.extensionConfiguration.server.terminalColor)
    );
    this.reactMailService.initExtension(context, this.terminalService, this.extensionConfiguration);
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
  
  private setupFileChangesListener(context: vscode.ExtensionContext): void {
    const disposables: vscode.Disposable[] = [];
    disposables.push(this.setupOnChangeListener());
    disposables.push(this.setupOnSaveListener());
    disposables.push(this.setupOnActiveDocumentListener());
    context.subscriptions.push(...disposables);
  }

  private setupOnChangeListener() {
    LoggingService.log("Setting up OnChange Listener");
    const disposable = vscode.workspace.onDidChangeTextDocument((event) => {
      const document = event.document;
      if (this.extensionConfiguration.renderOn !== RenderOnEnum.ON_CHANGE) return;
      if (document.languageId !== "javascriptreact" && document.languageId !== "typescriptreact") return;
      LoggingService.log(`file changed ${event.document.fileName}`);
      this.reactMailService.updateAndRenderEmail(document);
    });
    return disposable;
  }

  private setupOnSaveListener() {
    LoggingService.log("Setting up OnSave Listener");
    const disposable = vscode.workspace.onDidSaveTextDocument((document) => {
      if (this.extensionConfiguration.renderOn !== RenderOnEnum.ON_SAVE) return;
      if (document.languageId !== "javascriptreact" && document.languageId !== "typescriptreact") return;
      LoggingService.log(`file saved ${document.fileName}`);
      this.reactMailService.updateAndRenderEmail(document);
    });
    return disposable;
  }

  private setupOnActiveDocumentListener() {
    const disposable = vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (!editor) return;
      const document = editor.document;
      if (document.languageId !== "javascriptreact" && document.languageId !== "typescriptreact") return;
      LoggingService.log(`Updating And Rendering Active file ${document.fileName}`);
      this.reactMailService.updateAndRenderEmail(document);
    });
    return disposable;
  }
}
