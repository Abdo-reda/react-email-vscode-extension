import * as vscode from "vscode";
import { Terminal } from "vscode";
import { PackageManagerEnum } from "../constants/packageManagerEnum";
import { ISimplePackage } from "./simplePackageInterface";
import { ChildProcess } from "child_process";
import { IRenderEmail } from "./renderEmailOutput";
import { RenderApproachEnum } from "../constants/renderApproachEnum";

export interface IPackageManagerService {
  packageManager: PackageManagerEnum;
  renderApproach: RenderApproachEnum;
  renderTerminal: Terminal|undefined;
  // emailServerTerminal: Terminal|undefined;
  // emailScriptTerminal: Terminal|undefined;
  // emailRenderScriptProcess: ChildProcess|undefined;

  init(
    renderApproach: RenderApproachEnum, 
    projectPath: vscode.Uri,
    scriptSuccess: (output: string) => void, 
    scriptError: (output: string) => void, 
    serverSuccess: (output: IRenderEmail) => void, 
    serverError: (error: unknown) => void
  ): void;
  checkInstalled(): boolean;
  switchRenderApproach(renderApproach: RenderApproachEnum): void;
  
  isTerminalRunning(): boolean;
  runRenderTerminal(): void;

  // isRenderScriptRunning(): boolean;
  // runRenderScript(cwd: string | undefined, successCallback: (output: IRenderEmail) => void, errorCallback: (error: unknown) => void): void;
  killRenderScript(): void;
  
  setupEmailServerProject(cwd: string | undefined, errorCallback: (output: string) => void, successCallback: (output: string) => void): void;
  // isEmailServerRunning(): boolean;
  // runEmailServer(port: number, projectPath: vscode.Uri, showTerminal: boolean, terminalColor: vscode.ThemeColor, successCallback: () => void): void;
  restartEmailServer(port: number, projectPath: vscode.Uri, showTerminal: boolean, terminalColor: vscode.ThemeColor): Promise<void>;
  killEmailServer(): Promise<void>;
  showEmailServer(): void;

  installPackages(packages: ISimplePackage[], cwd: string | undefined, errorCallback?: (output: string) => void, successCallback?: (output: string) => void): void;
  getPackageVersions(version: string): Promise<string[]>;
  isValidPackageVersion(name: string, version: string): Promise<boolean>;
  // downloadPackage(name: string, version: string): boolean;
}
