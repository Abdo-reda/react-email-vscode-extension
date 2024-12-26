import * as vscode from "vscode";
import { ChildProcess } from "child_process";
import { IPackageManagerService } from "../../interfaces/packageManagerServiceInterface";
import { IPackageRegistry } from "../../interfaces/packageRegistryInterface";
import { LoggingService } from "../loggingService";
import { Terminal } from "vscode";
import { PackagesEnum } from "../../constants/packagesEnum";

export abstract class BasePackageService implements IPackageManagerService {
  emailServerTerminal: Terminal | undefined;
  emailServer: ChildProcess | undefined;
  private packageVersions = new Map<string, string[]>();

  setupProject(version: string, projectPath: vscode.Uri) {
    this.setupDirectories(projectPath);
    this.installPackage(PackagesEnum.REACT_EMAIL, version, projectPath.fsPath);
  }

  /**
   * Retrieves the package metadata from npm.
   * [Reference](https://github.com/npm/registry/blob/main/docs/responses/package-metadata.md).
   */
  async getPackageVersions(name: string): Promise<string[]> {
    if (this.packageVersions.get(name)?.length) return Promise.resolve(this.packageVersions.get(name)!);
    const res = await fetch(`https://registry.npmjs.org/${name}`);
    const registry = (await res.json()) as IPackageRegistry;
    const versions = Object.keys(registry.versions).reverse();
    this.packageVersions.set(name, versions);
    return versions;
  }

  async isValidPackageVersion(name: string, version: string): Promise<boolean> {
    return (await this.getPackageVersions(name)).some((v) => v === version);
  }

  killEmailServer(): void {
    LoggingService.log(`Killing Email Server`);
    this.emailServerTerminal?.dispose();
  }

  setupDirectories(projectPath: vscode.Uri): void {
    const emailsFolder = vscode.Uri.joinPath(projectPath, "emails");
    vscode.workspace.fs.createDirectory(emailsFolder);
    const mainEmail = vscode.Uri.joinPath(emailsFolder, "main.tsx");
    vscode.workspace.fs.writeFile(mainEmail, new Uint8Array());
    LoggingService.log(`Init Emails folder at ${emailsFolder.fsPath}`);
  }

  abstract runEmailServer(port: string, projectPath: vscode.Uri): void;
  abstract checkVersion(): boolean;
  abstract downloadPackage(_name: string, _version: string): boolean;
  abstract installPackage(_name: string, _version: string, _cwd: string | undefined): boolean;
}
