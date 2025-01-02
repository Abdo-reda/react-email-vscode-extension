import * as vscode from "vscode";
import { Terminal } from "vscode";
import { PackageManagerEnum } from "../constants/packageManagerEnum";
import { ISimplePackage } from "./simplePackageInterface";
import { ChildProcess } from "child_process";

export interface IPackageManagerService {
  packageManager: PackageManagerEnum;
  emailServerTerminal: Terminal|undefined;
  emailRenderScriptProcess: ChildProcess|undefined;

  checkInstalled: () => boolean;

  setupServerProject: (cwd: string | undefined, errorCallback: (output: string) => void, successCallback: (output: string) => void) => void;
  startRenderScript: (cwd: string | undefined) => void;
  killRenderScript: () => void;

  isServerRunning: () => boolean;
  runEmailServer: (port: number, projectPath: vscode.Uri, showTerminal: boolean, terminalColor: vscode.ThemeColor) => void;
  restartServer: (port: number, projectPath: vscode.Uri, showTerminal: boolean, terminalColor: vscode.ThemeColor) => Promise<void>;
  killEmailServer: () => Promise<void>;
  showEmailServer: () => void;

  installPackages: (packages: ISimplePackage[], cwd: string | undefined, errorCallback?: (output: string) => void, successCallback?: (output: string) => void) => void;
  getPackageVersions: (version: string) => Promise<string[]>;
  isValidPackageVersion: (name: string, version: string) => Promise<boolean>;
  // downloadPackage: (name: string, version: string) => boolean;
}
