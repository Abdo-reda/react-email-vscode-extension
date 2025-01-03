import { getActiveDocument, showErrorMessage, showInfoMessage, updateConfiguration } from "../utilities/vscodeUtilities";
import * as vscode from "vscode";
import * as path from "path";
import { LoggingService } from "./loggingService";
import { IPackageManagerService } from "../interfaces/packageManagerServiceInterface";
import { PackagesEnum } from "../constants/packagesEnum";
import { PackageManagerServiceFactory } from "./packageManagers/packageManagerServiceFactory";
import { RENDER_EMAIL_SCRIPT } from "../constants/renderScriptConstant";
import { PreviewPanelService } from "./previewPanelService";
import { PackageManagerEnum } from "../constants/packageManagerEnum";
import { RenderOnEnum } from "../constants/renderOnEnum";
import { RenderApproachEnum } from "../constants/renderApproachEnum";
import { getServerWebviewContent } from "../constants/previewWebviewConstant";
import { IExtensionConfigurationService } from "../interfaces/extensionConfigurationServiceInterface";
import { IRenderEmail } from "../interfaces/renderEmailOutput";
import { StatusBarService } from "./statusBarService";

export class ReactEmailService {
  private encoder = new TextEncoder();
  private isSettingProjectUp = false;
  private storagePath: vscode.Uri = vscode.Uri.file("");
  private latestEmailDocument: vscode.TextDocument|undefined;
  
  private extensionConfigurationService!: IExtensionConfigurationService;
  private packageManagerService!: IPackageManagerService;


  constructor() {
    this.installProjectPackages = this.installProjectPackages.bind(this);
  }

  async initExtension(context: vscode.ExtensionContext, extensionConfigurationService: IExtensionConfigurationService): Promise<void> {
    LoggingService.log("Initialising react-email ...");
    this.storagePath = context.extensionUri;
    this.extensionConfigurationService = extensionConfigurationService;
    this.switchPackageManagerService(this.extensionConfigurationService.packageManager);
    this.setupFileChangesListener(context);
  }

  getPackageVersions(packageName: PackagesEnum) {
    return this.packageManagerService.getPackageVersions(packageName);
  }

  renderActiveDocument() {
    const document = getActiveDocument();
    if (!document) return;
    if (document.languageId !== "javascriptreact" && document.languageId !== "typescriptreact") return;
    LoggingService.log(`Rendering Active file ${document.fileName}`);
    this.updateAndRenderEmail(document);
  }

  private switchPackageManagerService(packageManager: PackageManagerEnum): void {
    this.packageManagerService = PackageManagerServiceFactory.getService(packageManager);
    this.initPackageManagerService();
  }

  private setupFileChangesListener(context: vscode.ExtensionContext): void {
    const disposables: vscode.Disposable[] = [];
    disposables.push(this.setupOnChangeListener());
    disposables.push(this.setupOnSaveListener());
    disposables.push(this.setupOnChangeActiveDocumentListener());
    context.subscriptions.push(...disposables);
  }

  private initPackageManagerService(): void {
    LoggingService.log(`Checking Package Manager ${this.extensionConfigurationService.packageManager}`);
    const exists = this.packageManagerService.checkInstalled();
    if (!exists) {
      showErrorMessage(
        `Could not find a suitable package manager. ${this.extensionConfigurationService.packageManager} is not installed. Please make sure its installed and available globally or select a different package manager.`
      );
      return;
    }
    this.setupExternalProject();
  }

  private async setupExternalProject() {
    LoggingService.log(`Setting up external project '${this.extensionConfigurationService.renderApproach}' approach`);
    this.isSettingProjectUp = true;
    PreviewPanelService.setLoadingState();

    if (this.extensionConfigurationService.renderApproach === RenderApproachEnum.SCRIPT) {
      this.settingUpScriptProject(this.installProjectPackages);
    } else if (this.extensionConfigurationService.renderApproach === RenderApproachEnum.SERVER) {
      this.settingUpServerProject(this.installProjectPackages);
    }

    LoggingService.log(`Main Email file at ${this.mainEmailFilePath.fsPath}`);
  }

  private settingUpServerProject(onFinish: () => void) {
    this.packageManagerService.setupEmailServerProject(
      this.storagePath.fsPath,
      () => LoggingService.warn("There was an error setting up the server project"),
      onFinish
    );
  }

  private settingUpScriptProject(onFinish: () => void) {
    Promise.all([
      vscode.workspace.fs.writeFile(this.scriptFilePath, this.encoder.encode(RENDER_EMAIL_SCRIPT)),
      vscode.workspace.fs.writeFile(this.mainEmailFilePath, new Uint8Array()),
    ])
    .then(onFinish)
    .catch(() => LoggingService.warn("There was an error setting up the script project"));
  }

  private installProjectPackages() {
    LoggingService.log("Installing Packages in external project");

    this.packageManagerService.installPackages(
      [
        { name: PackagesEnum.REACT_EMAIL_RENDER, version: this.extensionConfigurationService.getCurrentVisionOfPackage(PackagesEnum.REACT_EMAIL_RENDER)},
        { name: PackagesEnum.REACT_EMAIL_COMPONENTS, version: this.extensionConfigurationService.getCurrentVisionOfPackage(PackagesEnum.REACT_EMAIL_COMPONENTS) },
        { name: PackagesEnum.REACT, version: this.extensionConfigurationService.getCurrentVisionOfPackage(PackagesEnum.REACT) },
        { name: PackagesEnum.REACT_DOM, version: this.extensionConfigurationService.getCurrentVisionOfPackage(PackagesEnum.REACT_DOM) },
      ],
      this.projectPath.fsPath,
      (error) => {
        this.isSettingProjectUp = false;
        LoggingService.warn("Error Setting up External Project");
        showErrorMessage("There was an error setting up the external project for react-email. Please check Logs");
        PreviewPanelService.setErrorState(error);
      },
      () => {
        this.isSettingProjectUp = false;
        LoggingService.log("Successfully Setup up External Project");
        showInfoMessage("Successfully setup external project for react-email");
        if (this.latestEmailDocument) {
          this.updateAndRenderEmail(this.latestEmailDocument);
        } else {
          PreviewPanelService.setNoneState();
        }
      }
    );
  }

  private setupOnChangeListener() {
    LoggingService.log("Setting up OnChange Listener");
    const disposable = vscode.workspace.onDidChangeTextDocument((event) => {
      const document = event.document;
      if (this.extensionConfigurationService.renderOn !== RenderOnEnum.ON_CHANGE) return;
      if (document.languageId !== "javascriptreact" && document.languageId !== "typescriptreact") return;
      LoggingService.log(`file changed ${event.document.fileName}`);
      this.updateAndRenderEmail(document);
    });
    return disposable;
  }

  private setupOnSaveListener() {
    LoggingService.log("Setting up OnSave Listener");
    const disposable = vscode.workspace.onDidSaveTextDocument((document) => {
      if (this.extensionConfigurationService.renderOn !== RenderOnEnum.ON_SAVE) return;
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
    StatusBarService.setLoadingState();
    this.latestEmailDocument = document;
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

    if (this.extensionConfigurationService.renderApproach === RenderApproachEnum.SCRIPT) {
      this.handleScriptEmailRender();
    } else if (this.extensionConfigurationService.renderApproach === RenderApproachEnum.SERVER) {
      this.handleServerEmailRender();
    }
  }

  private handleScriptEmailRender(): void {
     this.packageManagerService.runRenderScript(
      this.projectPath.fsPath,
      this.onScriptEmailRenderSuccess,
      this.onScriptEmailRenderError
    );
  }

  private handleServerEmailRender(): void {
    this.packageManagerService.runEmailServer(
      this.extensionConfigurationService.server.port,
      this.projectPath,
      this.extensionConfigurationService.server.terminalVisibility,
      new vscode.ThemeColor(this.extensionConfigurationService.server.terminalColor),
      this.onServerEmailRenderSuccess
    );
  }

  private onServerEmailRenderSuccess(): void {
    PreviewPanelService.setPreviewState({ 
      text: "N/A",
      html: getServerWebviewContent(this.extensionConfigurationService.server.port),
    });
    StatusBarService.setSuccessState(); 
  }

  private onScriptEmailRenderSuccess(renderOutput: IRenderEmail): void {
    LoggingService.log(`Successfully executed render email script.`);
    PreviewPanelService.setPreviewState(renderOutput);
    StatusBarService.setSuccessState();
  }

  private onScriptEmailRenderError(error: unknown): void {
    LoggingService.warn("There was an error while rendering the email.");
    if (error instanceof Error) PreviewPanelService.setErrorState(error.message);
    StatusBarService.setErrorState();
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
