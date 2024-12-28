import { ExtensionConfigurations } from "../constants/configurationEnum";
import { getActiveDocument, getConfiguration, isConfigurationChanged, runCommandInBackground, showErrorMessage, showInfoMessage, updateConfiguration } from "../utilities/vscodeUtilities";
import * as vscode from "vscode";
import * as path from "path";
import { LoggingService } from "./loggingService";
import { StatusBarService } from "./statusBarService";
import { IPackageManagerService } from "../interfaces/packageManagerServiceInterface";
import { PackageManagerEnum } from "../constants/packageManagerEnum";
import { PackagesEnum } from "../constants/packagesEnum";
import { PackageManagerServiceFactory } from "./packageManagers/packageManagerServiceFactory";

export class ReactEmailService {
  private reactEmailVersion = "latest";
  private storagePath: vscode.Uri = vscode.Uri.file("");
  private statusBarService!: StatusBarService;

  private packageManager = PackageManagerEnum.NPM;
  private packageManagerService!: IPackageManagerService;
  private serverPort: number = 7777;
  private serverTerminalShow: boolean = false;
  private serverTerminalColor: string = "terminal.ansiCyan";

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
    // runCommandInBackground(`command`, this.onCommandError, this.onCommandSuccess, dir);
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
    this.serverPort = getConfiguration<number>(ExtensionConfigurations.SERVER_PORT) ?? 7777;
    this.serverTerminalShow = getConfiguration<boolean>(ExtensionConfigurations.SERVER_TERMINAL_SHOW) ?? false;
    this.serverTerminalColor = getConfiguration<string>(ExtensionConfigurations.SERVER_TERMINAL_COLOR) ?? "terminal.ansiCyan";

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
    const versions = await this.packageManagerService.getPackageVersions(PackagesEnum.REACT_EMAIL);

    const selectedVersion = await vscode.window.showQuickPick(["latest", ...versions], {
      placeHolder: `Current version: ${this.reactEmailVersion}`,
      title: "Select the version to use",
    });

    if (!selectedVersion) return;

    await updateConfiguration(ExtensionConfigurations.REACT_EMAIL_VERSION, selectedVersion, vscode.ConfigurationTarget.Workspace); //TODO: should this be based on the workspace
    LoggingService.log(`Updated react-email version to ${selectedVersion}`);
  }

  private switchPackageManagerService(): void {
    this.packageManagerService = PackageManagerServiceFactory.getService(this.packageManager);
    this.initPackageManagerService();
  }

  runServer(): void {
    //TODO: add a port configuraiton later.
    //TODO: fix email render version
    this.packageManagerService.runEmailServer(this.serverPort, this.projectPath, this.serverTerminalShow, new vscode.ThemeColor(this.serverTerminalColor));
  }

  showServerTerminal(): void {
    this.packageManagerService.showEmailServer();
  }

  private initPackageManagerService(): void {
    LoggingService.log(`Checking Package Manager ${this.packageManager}`);
    const exists = this.packageManagerService.checkInstalled();
    if (!exists) {
      showErrorMessage(`Could not find a suitable package manager. The package manager ${this.packageManager} is not installed. Please make sure its installed and available globally or select a different package manager.`);
      return;
    }
    this.setupExternalProject();
  }

  private setupExternalProject() {
    this.setupExternalProjectDirectories(this.projectPath);
    //TODO: maybe show a loading message instead.
    this.packageManagerService.installPackages(
      //TODO: replace with configuration/setting
      [
        { name: PackagesEnum.REACT_EMAIL, version: "latest" },
        { name: PackagesEnum.REACT_EMAIL_COMPONENTS, version: "latest" },
        { name: PackagesEnum.REACT, version: "latest" },
        { name: PackagesEnum.REACT_DOM, version: "latest" },
      ],
      this.projectPath.fsPath,
      () => showErrorMessage("There was an error setting up the external project for react-email. Please check Logs."),
      () => showInfoMessage("Succesfully setup external project for react-email")
    );
  }

  private setupExternalProjectDirectories(projectPath: vscode.Uri) {
    const emailsFolder = vscode.Uri.joinPath(projectPath, "emails");
    vscode.workspace.fs.createDirectory(emailsFolder);
    const mainEmailFile = vscode.Uri.joinPath(emailsFolder, "main.tsx");
    vscode.workspace.fs.writeFile(mainEmailFile, new Uint8Array());
    LoggingService.log(`Init Emails folder at ${emailsFolder.fsPath}`);
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
    return `http://localhost:${this.serverPort}/preview/main`;
  }
}
