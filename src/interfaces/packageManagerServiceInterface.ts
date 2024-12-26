import { ChildProcess } from "child_process";
import { Terminal } from "vscode";
import * as vscode from "vscode";

export interface IPackageManagerService {
  emailServerTerminal: Terminal|undefined;
  emailServer: ChildProcess|undefined;
  setupProject: (version: string, projectPath: vscode.Uri) => void;
  isValidPackageVersion: (name: string, version: string) => Promise<boolean>;
  getPackageVersions: (version: string) => Promise<string[]>;
  killEmailServer: () => void;
  runEmailServer: (port: string, projectPath: vscode.Uri) => void;
  checkVersion: () => boolean;
  // downloadPackage: (name: string, version: string) => boolean;
  installPackage: (name: string, version: string,  cwd: string|undefined) => boolean;
}
