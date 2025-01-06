import * as vscode from "vscode";
import { PackageManagerEnum } from "../constants/packageManagerEnum";
import { ISimplePackage } from "./simplePackageInterface";
import { IRenderEmail } from "./renderEmailOutput";
import { RenderApproachEnum } from "../constants/renderApproachEnum";
import { TerminalService } from "../services/terminalService";

export interface IPackageManagerService {
  packageManager: PackageManagerEnum;
  terminalService: TerminalService;
  renderApproach: RenderApproachEnum;
  projectPath: vscode.Uri;
  scriptSuccess: (output: string) => void;
  scriptError: (output: string) => void;
  serverSuccess: (output: IRenderEmail) => void;
  serverError: (error: unknown) => void;

  // renderTerminal: vscode.Terminal | undefined;
  // emailServerTerminal: Terminal|undefined;
  // emailScriptTerminal: Terminal|undefined;
  // emailRenderScriptProcess: ChildProcess|undefined;

  checkInstalled(): boolean;
  installPackages(packages: ISimplePackage[], cwd: string | undefined, errorCallback?: (output: string) => void, successCallback?: (output: string) => void): void;
  getPackageVersions(version: string): Promise<string[]>;
  isValidPackageVersion(name: string, version: string): Promise<boolean>;
  setupExternalProject(cwd: string | undefined, errorCallback: (output: string) => void, successCallback?: (output: string) => void): void;
  switchRenderApproach(renderApproach: RenderApproachEnum): void;
  runRenderTerminal(): void;
  restartRenderTerminal(): Promise<void>;
  
  // isRenderScriptRunning(): boolean;
  // runRenderScript(cwd: string | undefined, successCallback: (output: IRenderEmail) => void, errorCallback: (error: unknown) => void): void;
  // killRenderScript(): void;
  // isEmailServerRunning(): boolean;
  // runEmailServer(port: number, projectPath: vscode.Uri, showTerminal: boolean, terminalColor: vscode.ThemeColor, successCallback: () => void): void;
  // restartEmailServer(port: number, projectPath: vscode.Uri, showTerminal: boolean, terminalColor: vscode.ThemeColor): Promise<void>;
  // killEmailServer(): Promise<void>;
  // showEmailServer(): void;
  // downloadPackage(name: string, version: string): boolean;
}
