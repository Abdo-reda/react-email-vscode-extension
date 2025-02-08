import * as vscode from "vscode";
import * as path from "path";
import { getActiveDocument, showErrorMessage, showInfoMessage } from "../utilities/vscodeUtilities";
import { LoggingService } from "./loggingService";
import { IPackageManagerService } from "../interfaces/packageManagerServiceInterface";
import { PackagesEnum } from "../constants/packagesEnum";
import { PackageManagerServiceFactory } from "./packageManagers/packageManagerServiceFactory";
import { RENDER_EMAIL_SCRIPT } from "../constants/renderScriptConstant";
import { PreviewPanelService } from "./previewPanelService";
import { PackageManagerEnum } from "../constants/packageManagerEnum";
import { IExtensionConfigurationService } from "../interfaces/extensionConfigurationServiceInterface";
import { StatusBarService } from "./statusBarService";
import { TerminalService } from "./terminalService";
import { RenderApproachEnum } from "../constants/renderApproachEnum";
import { getServerWebviewContent } from "../constants/previewWebviewConstant";

export class ReactEmailService {
  private encoder = new TextEncoder();
  private isSettingProjectUp = false;
  private storagePath: vscode.Uri = vscode.Uri.file("");
  private latestEmailDocument: vscode.TextDocument | undefined;

  private extensionConfiguration!: IExtensionConfigurationService;
  private packageManagerService!: IPackageManagerService;
  private terminalService!: TerminalService;

  constructor() {
    this.installProjectPackages = this.installProjectPackages.bind(this);
    this.onSetupFailure = this.onSetupFailure.bind(this);
    this.onSetupSuccess = this.onSetupSuccess.bind(this);
  }

  async initExtension(context: vscode.ExtensionContext, terminalService: TerminalService, extensionConfigurationService: IExtensionConfigurationService): Promise<void> {
    LoggingService.log("Initialising react-email-renderer ...");
    this.storagePath = context.extensionUri;
    this.extensionConfiguration = extensionConfigurationService;
    this.terminalService = terminalService;
    this.switchPackageManagerService(this.extensionConfiguration.packageManager);
  }

  getPackageVersions(packageName: PackagesEnum) {
    return this.packageManagerService.getPackageVersions(packageName);
  }

  renderActiveDocument() {
    const document = getActiveDocument() ?? this.latestEmailDocument;
    if (!document) return;
    if (document.languageId !== "javascriptreact" && document.languageId !== "typescriptreact") return;
    LoggingService.log(`Rendering Active file ${document.fileName}`);
    this.updateAndRenderEmail(document);
  }

  private switchPackageManagerService(packageManager: PackageManagerEnum): void {
    this.packageManagerService = PackageManagerServiceFactory.getService(packageManager);
    this.initPackageManagerService();
  }

  private initPackageManagerService(): void {
    LoggingService.log(`Checking Package Manager ${this.extensionConfiguration.packageManager}`);
    const exists = this.packageManagerService.checkInstalled();
    if (!exists) {
      showErrorMessage(
        `Could not find a suitable package manager. ${this.extensionConfiguration.packageManager} is not installed. Please make sure its installed and available globally or select a different package manager.`
      );
      return;
    }
    this.setupExternalProject();
  }

  private setupExternalProject() {
    LoggingService.log(`Setting up external project '${this.extensionConfiguration.renderApproach}' approach`);
    this.isSettingProjectUp = true;
    PreviewPanelService.setLoadingState();
    StatusBarService.setLoadingState();

    LoggingService.log(`Main Email file at ${this.mainEmailFilePath.fsPath}`);

    if (this.extensionConfiguration.renderApproach === RenderApproachEnum.SCRIPT) {
      this.setupScriptProject();
    } else if (this.extensionConfiguration.renderApproach === RenderApproachEnum.SERVER) {
      this.setupServerProject();
    }
  }

  private async setupScriptProject() {
    await Promise.all([
      vscode.workspace.fs.writeFile(this.scriptFilePath, this.encoder.encode(RENDER_EMAIL_SCRIPT)),
      vscode.workspace.fs.writeFile(this.mainEmailFilePath, new Uint8Array()),
    ]);

    this.installProjectPackages();
  }

  private setupServerProject() {
    this.packageManagerService.executeCommand(
      "degit Abdo-reda/react-email-render-template#main project --force",
      this.storagePath.fsPath,
      () => LoggingService.warn("There was an error setting up the server project"),
      this.installProjectPackages
    );
  }

  private installProjectPackages() {
    LoggingService.log("Installing Packages in external project");

    this.packageManagerService.installPackages(
      [
        {
          name: PackagesEnum.REACT_EMAIL_RENDER,
          version: this.extensionConfiguration.getCurrentVisionOfPackage(PackagesEnum.REACT_EMAIL_RENDER),
        },
        {
          name: PackagesEnum.REACT_EMAIL_COMPONENTS,
          version: this.extensionConfiguration.getCurrentVisionOfPackage(PackagesEnum.REACT_EMAIL_COMPONENTS),
        },
        { name: PackagesEnum.REACT, version: this.extensionConfiguration.getCurrentVisionOfPackage(PackagesEnum.REACT) },
        {
          name: PackagesEnum.REACT_DOM,
          version: this.extensionConfiguration.getCurrentVisionOfPackage(PackagesEnum.REACT_DOM),
        },
      ],
      this.projectPath.fsPath,
      this.onSetupFailure,
      this.onSetupSuccess
    );
  }

  private onSetupFailure(error: string) {
    this.isSettingProjectUp = false;
    LoggingService.warn("Error Setting up External Project");
    showErrorMessage("There was an error setting up the external project for react-email-renderer. Please check Logs");
    PreviewPanelService.setErrorState(error);
  }

  private onSetupSuccess() {
    this.isSettingProjectUp = false;
    LoggingService.log("Successfully Setup up External Project");
    showInfoMessage("Successfully setup external project for react-email-renderer");
    if (this.latestEmailDocument) {
      this.updateAndRenderEmail(this.latestEmailDocument);
    } else {
      PreviewPanelService.setNoneState();
      StatusBarService.setDefaultState();
    }
  }

  async restartRenderProcess() {
    LoggingService.log(`Restarting ${this.extensionConfiguration.renderApproach} Render Terminal`);
    await this.terminalService.restart();
  }

  showRenderTerminal(): void {
    this.terminalService.show();
  }

  async updateAndRenderEmail(document: vscode.TextDocument) {
    StatusBarService.setLoadingState();
    const fileName = path.basename(document.fileName);
    if (!this.isSettingProjectUp && this.latestEmailDocument?.fileName !== document.fileName) PreviewPanelService.setRenderingState(fileName);
    PreviewPanelService.setEmailTitle(fileName);
    this.latestEmailDocument = document;
    await this.updateMainEmail(document);
    this.renderEmail();
  }

  private runServerTerminal(): void {
    LoggingService.log("Running Server Terminal");
    this.terminalService.runTerminal(this.packageManagerService.getCommandFormat(`vite --port=${this.extensionConfiguration.server.port}`), this.projectPath, (output) =>
      this.onServerEmailRenderCallback(output, false)
    );
  }

  private runScriptTerminal(): void {
    LoggingService.log("Running Script Terminal");
    this.terminalService.runTerminal(this.packageManagerService.getCommandFormat("tsx watch script"), this.projectPath, (output) =>
      this.onScriptEmailRenderCallback(output, false)
    );
  }

  private async updateMainEmail(document: vscode.TextDocument) {
    const text = document.getText();
    await vscode.workspace.fs.writeFile(this.mainEmailFilePath, this.encoder.encode(text));
  }

  private renderEmail(): void {
    //check if file is empty as well?  (await vscode.workspace.fs.readFile(this.mainEmailFilePath)).byteLength
    //I hate this...
    if (this.isSettingProjectUp) return;
    if (PreviewPanelService.isDisposed()) {
      if (!this.terminalService.activeExecution) StatusBarService.setDefaultState();
      return;
    }

    if (this.extensionConfiguration.renderApproach === RenderApproachEnum.SCRIPT) {
      this.runScriptTerminal();
    } else if (this.extensionConfiguration.renderApproach === RenderApproachEnum.SERVER) {
      this.runServerTerminal();
    }
  }

  private onServerEmailRenderCallback(_output: string, isError: boolean): void {
    LoggingService.log(`Recieved output from render email server, isError: ${isError}`);
    if (isError) {
      return;
    } else {
      PreviewPanelService.setPreviewState({
        text: "N/A",
        html: getServerWebviewContent(this.extensionConfiguration.server.port),
      });
      StatusBarService.setSuccessState(this.extensionConfiguration.server.port);
    }
  }

  private onScriptEmailRenderCallback(output: string, isError: boolean): void {
    LoggingService.log(`Executed render email script, isError: ${isError}`);
    if (isError) {
      // LoggingService.warn("There was an error while rendering the email.");
      // if (error instanceof Error) PreviewPanelService.setErrorState(error.message);
      // StatusBarService.setErrorState();
    } else {
      // PreviewPanelService.setPreviewState(renderOutput);
      // StatusBarService.setSuccessState();
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
