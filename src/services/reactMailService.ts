import { ExtensionConfigurations } from "../constants/configurationEnum";
import { getActiveDocument, getConfiguration, isConfigurationChanged, runCommandInBackground, showErrorMessage, updateConfiguration } from "../utilities/vscodeUtilities";
import * as vscode from "vscode";
import * as path from "path";
import { LoggingService } from "./loggingService";
import { StatusBarService } from "./statusBarService";
import { IPackageManagerService } from "../interfaces/packageManagerServiceInterface";
import { PackageManagerEnum } from "../constants/packageManagerEnum";
import { PackagesEnum } from "../constants/packagesEnum";
import { NpmService } from "./packageManagers/npmService";

export class ReactMailService {
  private reactEmailVersion = "latest";
  private packageManager = PackageManagerEnum.NPM;
  private packageService!: IPackageManagerService;
  private storagePath: vscode.Uri = vscode.Uri.file("");
  private statusBarService!: StatusBarService;

  constructor() {
    this.onCommandError = this.onCommandError.bind(this);
    this.onCommandSuccess = this.onCommandSuccess.bind(this);
  }

  async initExtension(context: vscode.ExtensionContext): Promise<void> {
    LoggingService.log("Initialising react-email ...");
    this.storagePath = context.extensionUri;
    this.setupConfigurations();
    this.switchPackageManagerService();
    const disposables = this.setupFileChangesListener();
    context.subscriptions.push(...disposables);
  }

  analyseActiveDocument() {
    const activeDocument = getActiveDocument();
    if (!activeDocument) return;
    this.analyseDocument(activeDocument);
  }

  private analysePath(analysisPath: string) {
    const dir = path.dirname(analysisPath);
    const base = path.basename(analysisPath);
    LoggingService.log(`Analysing ${dir} ${base}`);
    runCommandInBackground(`command`, this.onCommandError, this.onCommandSuccess, dir);
  }

  private onCommandError(output: string) {
    const errorOutput = JSON.parse(output);
    LoggingService.log("Analysis Output", errorOutput);
    this.statusBarService.setErrorState();
  }

  private setupFileChangesListener(): vscode.Disposable[] {
    const disposables: vscode.Disposable[] = [];
    // disposables.push(this.setupOnChangeListener());
    disposables.push(this.setupOnSaveListener());
    return disposables;
  }

  private analyseDocument(document: vscode.TextDocument) {
    this.statusBarService.setLoadingState();

    const documentURI = document.uri;
    const workspace = vscode.workspace.getWorkspaceFolder(documentURI);

    // if (this.analysisScope === AnalysisScope.FILE) {
    //   LoggingService.log("Analysing File Scope");
    //   this.analysePath(documentURI.fsPath);
    // } else if (this.analysisScope === AnalysisScope.DIRECTORY || !workspace) {
    //   LoggingService.log("Analysing Directory Scope");
    //   this.analysePath(vscode.Uri.joinPath(documentURI, '..').fsPath);
    // } else if (this.analysisScope === AnalysisScope.WORKSPACE && workspace) {
    //   LoggingService.log("Analysing Workspace Scope");
    //   this.analysePath(workspace.uri.fsPath);
    // }
  }

  private onCommandSuccess(_: string) {
    LoggingService.log(`Analysis completed successfully.`);
    this.statusBarService.setSuccessState();
  }

  private setupConfigurations() {
    this.reactEmailVersion = getConfiguration<string>(ExtensionConfigurations.REACT_EMAIL_VERSION) ?? "latest";
    this.packageManager = getConfiguration<PackageManagerEnum>(ExtensionConfigurations.PACKAGE_MANAGER) ?? PackageManagerEnum.NPM;

    //TODO: there is an issue with this !!!!
    return vscode.workspace.onDidChangeConfiguration((event) => {
      if (isConfigurationChanged(event, ExtensionConfigurations.REACT_EMAIL_VERSION)) {
        this.reactEmailVersion = getConfiguration<string>(ExtensionConfigurations.REACT_EMAIL_VERSION) ?? "latest";
        LoggingService.log(`${ExtensionConfigurations.REACT_EMAIL_VERSION} Configuration Changed ${this.reactEmailVersion}!`);
      }

      if (isConfigurationChanged(event, ExtensionConfigurations.PACKAGE_MANAGER)) {
        this.packageManager = getConfiguration<PackageManagerEnum>(ExtensionConfigurations.PACKAGE_MANAGER) ?? PackageManagerEnum.NPM;
        LoggingService.log(`${ExtensionConfigurations.PACKAGE_MANAGER} Configuration Changed ${this.packageManager}!`);
      }
    });
  }

  async chooseReactEmailVersion() {
    const versions = await this.packageService.getPackageVersions(PackagesEnum.REACT_EMAIL);

    const selectedVersion = await vscode.window.showQuickPick(["latest", ...versions], {
      placeHolder: `Current version: ${this.reactEmailVersion}`,
      title: "Select the version to use",
    });

    if (!selectedVersion) return;

    await updateConfiguration(ExtensionConfigurations.REACT_EMAIL_VERSION, selectedVersion, vscode.ConfigurationTarget.Workspace); //TODO: should this be based on the workspace
    LoggingService.log(`Updated react-email version to ${selectedVersion}`);
  }

  private switchPackageManagerService(): void {
    switch (this.packageManager) {
      case PackageManagerEnum.NPM:
        this.packageService = new NpmService();
        break;
      default:
        LoggingService.warn(`Selected Package Manager ${this.packageManager} is not Supported`);
    }
    this.initPackageManagerService();
  }

  runServer(): void {
    //TODO: add a port configuraiton later.
    //TODO: fix email render version
    this.packageService.runEmailServer("3000", this.projectPath);
  }

  private initPackageManagerService(): void {
    LoggingService.log(`Checking Package Manager ${this.packageManager}`);
    const exists = this.packageService.checkVersion();
    if (!exists) {
      showErrorMessage(`Could not find a suitable package manager. The package manager ${this.packageManager} is not installed. Please install it or select a different one.`);
      return;
    }
    this.packageService.setupProject(this.reactEmailVersion, this.projectPath);
  }

  private setupOnChangeListener() {
    // LoggingService.log("Setting up OnChange Listener");
    // const disposable = vscode.workspace.onDidChangeTextDocument(
    //   (event) => {
    //     if (this.analyseOn !== AnalysisOn.ON_CHANGE) return;
    //     LoggingService.log(`file changed ${event.document.fileName}`);
    //     this.analyseDocument(event.document);
    //   }
    // );
    // return disposable;
  }

  private setupOnSaveListener() {
    LoggingService.log("Setting up OnSave Listener");
    //TODO: only if file is a tsx/jsx file ... fix later
    const disposable = vscode.workspace.onDidSaveTextDocument((document) => {
      // if (this.analyseOn !== AnalysisOn.ON_SAVE) return;
      LoggingService.log(`file saved ${document.fileName}`);
      this.updateMainEmail(document);
    });
    return disposable;
  }

  private updateMainEmail(document: vscode.TextDocument) {
    const encoder = new TextEncoder(); //TODO: optmize this and fix this, maybe move to utility
    const text = document.getText();
    vscode.workspace.fs.writeFile(this.mainEmailFilePath, encoder.encode(text));
  }

  get mainEmailFilePath() {
    return vscode.Uri.joinPath(this.projectPath, "emails", "main.tsx");
  }

  get projectPath() {
    return vscode.Uri.joinPath(this.storagePath, `project`); //${this.reactEmailVersion}
  }

  get renderServerURL() {
    const port = "3000"; //TODO: make into configuration
    return `http://localhost:${port}/preview/main`;
  }
}
