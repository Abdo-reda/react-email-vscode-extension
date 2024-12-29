import { Terminal } from "vscode";
import * as vscode from "vscode";
import { PackageManagerEnum } from "../constants/packageManagerEnum";
import { ISimplePackage } from "./simplePackageInterface";
import { IRenderEmail } from "./renderEmailOutput";

export interface IPackageManagerService {
  packageManager: PackageManagerEnum;
  // emailServerTerminal: Terminal|undefined;
  checkInstalled: () => boolean;
  
  renderEmail: (cwd: string | undefined) => IRenderEmail;
  // restartServer: (port: number, projectPath: vscode.Uri, showTerminal: boolean, terminalColor: vscode.ThemeColor) => void;
  // runEmailServer: (port: number, projectPath: vscode.Uri, showTerminal: boolean, terminalColor: vscode.ThemeColor) => void;
  // showEmailServer: () => void;
  // killEmailServer: () => void;
  
  // setupProject: (version: string, projectPath: vscode.Uri) => void;
  installPackages: (packages: ISimplePackage[],  cwd: string|undefined, errorCallback?: (output: string) => void, successCallback?: (output: string) => void) => void;
  getPackageVersions: (version: string) => Promise<string[]>;
  isValidPackageVersion: (name: string, version: string) => Promise<boolean>;
  // downloadPackage: (name: string, version: string) => boolean;
}
