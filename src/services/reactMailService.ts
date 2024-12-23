import {
  ExtensionConfigurations,
} from "../constants/configurationEnum";
import replaceTokens from "../constants/languageTokensMap";
import {
  IErrorMessage,
} from "../interfaces/errorOutputInterface";
import {
  fileExistsAsync,
  getActiveDocument,
  getConfiguration,
  runCommandInBackground,
  showInfoMessage,
} from "../utilities/vscodeUtilities";
import { GithubService } from "./githubService";
import * as vscode from "vscode";
import * as path from 'path';
import { GlobalStateEnum } from "../constants/stateEnum";
import { LoggingService } from "./loggingService";
import { StatusBarService } from "./statusBarService";

export class ReactMailService {
  private githubService = new GithubService();
  private storagePath: vscode.Uri = vscode.Uri.file("");
  private statusBarService!: StatusBarService;

  constructor() {
    this.onAnalysisError = this.onAnalysisError.bind(this);
    this.onAnalysisSuccess = this.onAnalysisSuccess.bind(this);
  }

  async initPhpStanAsync(
    context: vscode.ExtensionContext,
  ): Promise<void> {
    LoggingService.log("Initialising react-mail ...");
    this.storagePath = context.extensionUri; 
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
    runCommandInBackground(
      `command`,
      this.onAnalysisError,
      this.onAnalysisSuccess,
      dir
    );
  }

  private onAnalysisError(output: string) {
    const errorOutput = JSON.parse(output);
    LoggingService.log('Analysis Output', errorOutput);
    this.statusBarService.setErrorState();
  }

  private setupFileChangesListener(): vscode.Disposable[] {
    const disposables: vscode.Disposable[] = [];
    // disposables.push(this.setupOnChangeListener());
    // disposables.push(this.setupOnSaveListener());
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

  private onAnalysisSuccess(output: string) {
    LoggingService.log(`Analysis completed successfully.`);
    this.statusBarService.setSuccessState();
  }

  private setupConfigListener() {
    // this.analysisLevel = getConfiguration<number>(ExtensionConfigurations.LEVEL) ?? 5;
    // this.analyseOn = getConfiguration<AnalysisOn>(ExtensionConfigurations.ANALYSIS_ON) ?? AnalysisOn.ON_SAVE;
    // this.analysisScope = getConfiguration<AnalysisScope>(ExtensionConfigurations.ANALYSIS_SCOPE) ?? AnalysisScope.DIRECTORY;

    // return vscode.workspace.onDidChangeConfiguration((event) => {
    //   if (event.affectsConfiguration(ExtensionConfigurations.ANALYSIS_ON)) {
    //     LoggingService.log("AnalysisOn Configuration Changed.");
    //     this.analyseOn = getConfiguration<AnalysisOn>(ExtensionConfigurations.ANALYSIS_ON) ?? AnalysisOn.ON_SAVE;
    //   }
    //   if (event.affectsConfiguration(ExtensionConfigurations.LEVEL)) {
    //     LoggingService.log("Level Configuration Changed.");
    //     this.analysisLevel = getConfiguration<number>(ExtensionConfigurations.LEVEL) ?? 5;
    //   }
    //   if (event.affectsConfiguration(ExtensionConfigurations.ANALYSIS_SCOPE)) {
    //     LoggingService.log("AnalysisScope Configuration Changed.");
    //     this.analysisScope = getConfiguration<AnalysisScope>(ExtensionConfigurations.ANALYSIS_SCOPE) ?? AnalysisScope.DIRECTORY;
    //   }
    // });
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
    // LoggingService.log("Setting up OnSave Listener");
    // const disposable = vscode.workspace.onDidSaveTextDocument(
    //   (document) => {
    //     if (this.analyseOn !== AnalysisOn.ON_SAVE) return;
    //     LoggingService.log(`file saved ${document.fileName}`);
    //     this.analyseDocument(document);
    //   }
    // );
    // return disposable;
  }
}
