import { ExtensionConfigurations } from "../constants/configurationEnum";
import { getActiveDocument, showErrorMessage, showInfoMessage, updateConfiguration } from "../utilities/vscodeUtilities";
import * as vscode from "vscode";
import * as path from "path";
import { LoggingService } from "./loggingService";
import { StatusBarService } from "./statusBarService";
import { IPackageManagerService } from "../interfaces/packageManagerServiceInterface";
import { PackagesEnum } from "../constants/packagesEnum";
import { PackageManagerServiceFactory } from "./packageManagers/packageManagerServiceFactory";
import { RENDER_EMAIL_SCRIPT } from "../constants/renderScriptConstant";
import { PreviewPanelService } from "./previewPanelService";
import { PackageManagerEnum } from "../constants/packageManagerEnum";
import { RenderOnEnum } from "../constants/renderOnEnum";
import { IExtensionConfiguration } from "../interfaces/extensionConfigurationInterface";

export class ReactEmailService {
  private encoder = new TextEncoder();
  private isSettingProjectUp = false;

  private reactEmailVersion = "latest";
  private storagePath: vscode.Uri = vscode.Uri.file("");
  private extensionConfiguration!: IExtensionConfiguration;

  private statusBarService!: StatusBarService;
  private packageManagerService!: IPackageManagerService;
  // private packageManager = PackageManagerEnum.NPM;
  // private serverPort: number = 7777;
  // private serverTerminalShow: boolean = false;
  // private serverTerminalColor: string = "terminal.ansiCyan";

  constructor() {
    this.onCommandError = this.onCommandError.bind(this);
    this.onCommandSuccess = this.onCommandSuccess.bind(this);
  }

  async initExtension(context: vscode.ExtensionContext, extensionConfiguration: IExtensionConfiguration): Promise<void> {
    LoggingService.log("Initialising react-email ...");
    this.storagePath = context.extensionUri;
    this.extensionConfiguration = extensionConfiguration;
    this.switchPackageManagerService(this.extensionConfiguration.packageManager);
    this.setupFileChangesListener(context);
  }

  updateExtensionConfiguration(newConfiguration: IExtensionConfiguration): void {
    if (this.extensionConfiguration.packageManager !== newConfiguration.packageManager) {
      this.switchPackageManagerService(newConfiguration.packageManager);
    }
    this.extensionConfiguration = newConfiguration;
  }

  private setupFileChangesListener(context: vscode.ExtensionContext): void {
    const disposables: vscode.Disposable[] = [];
    disposables.push(this.setupOnChangeListener());
    disposables.push(this.setupOnSaveListener());
    disposables.push(this.setupOnChangeActiveDocumentListener());
    context.subscriptions.push(...disposables);
  }

  private onCommandError(output: string) {
    const errorOutput = JSON.parse(output);
    LoggingService.log("Analysis Output", errorOutput);
    this.statusBarService.setErrorState();
  }

  private onCommandSuccess(_: string) {
    LoggingService.log(`Analysis completed successfully.`);
    this.statusBarService.setSuccessState();
  }

  //TODO: make this more generic
  async chooseReactEmailVersion() {
    const versions = await this.packageManagerService.getPackageVersions(PackagesEnum.REACT_EMAIL);

    const selectedVersion = await vscode.window.showQuickPick(["latest", ...versions], {
      placeHolder: `Current version: ${this.reactEmailVersion}`,
      title: "Select the version to use",
    });

    if (!selectedVersion) return;

    await updateConfiguration(ExtensionConfigurations.REACT_EMAIL_RENDER_VERSION, selectedVersion, vscode.ConfigurationTarget.Workspace); //TODO: should this be based on the workspace
    LoggingService.log(`Updated react-email version to ${selectedVersion}`);
  }

  switchPackageManagerService(packageManager: PackageManagerEnum): void {
    this.packageManagerService = PackageManagerServiceFactory.getService(packageManager);
    this.initPackageManagerService();
  }

  renderActiveDocument() {
    const document = getActiveDocument();
    if (!document) return;
    if (document.languageId !== "javascriptreact" && document.languageId !== "typescriptreact") return;
    LoggingService.log(`Rendering Active file ${document.fileName}`);
    this.updateAndRenderEmail(document);
  }

  private initPackageManagerService(): void {
    LoggingService.log(`Checking Package Manager ${this.extensionConfiguration.packageManager}`);
    const exists = this.packageManagerService.checkInstalled();
    if (!exists) {
      showErrorMessage(`Could not find a suitable package manager. ${this.extensionConfiguration.packageManager} is not installed. Please make sure its installed and available globally or select a different package manager.`);
      return;
    }
    this.setupExternalProject();
  }

  private setupExternalProject() {
    this.isSettingProjectUp = true;
    PreviewPanelService.setLoadingState();
    // if live server
    this.setupExternalProjectDirectories();
    //TODO: maybe show a loading message instead.

    //this.packageManagerService.setupProject()
    //- if live -->
    //- if not live -->
    //npm exec -y -- degit Abdo-reda/react-email-render-template#main project
    this.packageManagerService.installPackages(
      //TODO: replace with configuration/setting
      [
        { name: PackagesEnum.REACT_EMAIL_RENDER, version: "latest" },
        { name: PackagesEnum.REACT_EMAIL_COMPONENTS, version: "latest" },
        { name: PackagesEnum.REACT, version: "latest" },
        { name: PackagesEnum.REACT_DOM, version: "latest" },
      ],
      this.projectPath.fsPath,
      (error) => {
        this.isSettingProjectUp = false;
        showErrorMessage("There was an error setting up the external project for react-email. Please check Logs");
        PreviewPanelService.setErrorState(error);
      },
      () => {
        this.isSettingProjectUp = false;
        showInfoMessage("Succesfully setup external project for react-email");
        PreviewPanelService.setNoneState(); //TODO: maybe ready state or preview if there is no email should be ready, or update the none state to be ready state.
        this.renderEmail();
      }
    );
  }

  private setupExternalProjectDirectories() {
    vscode.workspace.fs.writeFile(this.scriptFilePath, this.encoder.encode(RENDER_EMAIL_SCRIPT));
    vscode.workspace.fs.writeFile(this.mainEmailFilePath, new Uint8Array());
    LoggingService.log(`Init Main Email file at ${this.mainEmailFilePath.fsPath}`);
  }

  private setupOnChangeListener() {
    LoggingService.log("Setting up OnChange Listener");
    const disposable = vscode.workspace.onDidChangeTextDocument((event) => {
      const document = event.document;
      if (this.extensionConfiguration.renderOn !== RenderOnEnum.ON_CHANGE) return;
      if (document.languageId !== "javascriptreact" && document.languageId !== "typescriptreact") return;
      LoggingService.log(`file changed ${event.document.fileName}`);
      this.updateAndRenderEmail(document);
    });
    return disposable;
  }

  private setupOnSaveListener() {
    LoggingService.log("Setting up OnSave Listener");
    const disposable = vscode.workspace.onDidSaveTextDocument((document) => {
      if (this.extensionConfiguration.renderOn !== RenderOnEnum.ON_SAVE) return;
      if (document.languageId !== "javascriptreact" && document.languageId !== "typescriptreact") return;
      LoggingService.log(`file saved ${document.fileName}`);
      this.updateAndRenderEmail(document);
    });
    return disposable;
  }

  private setupOnChangeActiveDocumentListener() {
    const disposable = vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (!editor) return;
      const document = editor.document;
      if (document.languageId !== "javascriptreact" && document.languageId !== "typescriptreact") return;
      LoggingService.log(`Updating And Rendering Active file ${document.fileName}`);
      this.updateAndRenderEmail(document);
    });
    return disposable;
  }

  private async updateAndRenderEmail(document: vscode.TextDocument) {
    await this.updateMainEmail(document);
    this.renderEmail();
  }

  private async updateMainEmail(document: vscode.TextDocument) {
    PreviewPanelService.setEmailTitle(path.basename(document.fileName));
    const text = document.getText();
    await vscode.workspace.fs.writeFile(this.mainEmailFilePath, this.encoder.encode(text));
  }

  private renderEmail(): void {
    if (PreviewPanelService.isDisposed() || this.isSettingProjectUp) return; //check if file is empty as well?  (await vscode.workspace.fs.readFile(this.mainEmailFilePath)).byteLength
    try {
      const renderOutput = this.packageManagerService.renderEmail(this.projectPath.fsPath);
      LoggingService.log(`Successfully executed render email script.`);
      PreviewPanelService.setPreviewState(renderOutput);
    } catch (error) {
      LoggingService.warn("There was an error while rendering the email.");
      if (error instanceof Error) PreviewPanelService.setErrorState(error.message);
    }
  }

  get scriptFilePath() {
    return vscode.Uri.joinPath(this.projectPath, "script.js");
  }

  get mainEmailFilePath() {
    return vscode.Uri.joinPath(this.projectPath, "email.tsx");
  }

  get projectPath() {
    return vscode.Uri.joinPath(this.storagePath, `project`); //${this.reactEmailVersion}
  }

  // get renderServerURL() {
  //   return `http://localhost:${this.serverPort}/preview/main`;
  // }
}
