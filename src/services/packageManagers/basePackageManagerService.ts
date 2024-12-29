import * as vscode from "vscode";
import { IPackageManagerService } from "../../interfaces/packageManagerServiceInterface";
import { IPackageRegistry } from "../../interfaces/packageRegistryInterface";
import { LoggingService } from "../loggingService";
import { Terminal } from "vscode";
import { PackageManagerEnum } from "../../constants/packageManagerEnum";
import { ISimplePackage } from "../../interfaces/simplePackageInterface";
import { IRenderEmail } from "../../interfaces/renderEmailOutput";

export abstract class BasePackageManagerService implements IPackageManagerService {
  abstract packageManager: PackageManagerEnum;
  private packageVersions = new Map<string, string[]>(); //TODO: cache in global state or something
  protected scriptOutputRegex = /\[HTML\]:(.*?)\[TEXT\]:(.*)/;

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

  abstract renderEmail(cwd: string | undefined): IRenderEmail;
  abstract checkInstalled(): boolean;
  abstract downloadPackage(_name: string, _version: string): boolean;
  abstract installPackages(_packages: ISimplePackage[], _cwd: string | undefined, _errorCallback?: (output: string) => void, _successCallback?: (output: string) => void): void;

  // emailServerTerminal: Terminal | undefined;

  // abstract runEmailServer(port: number, projectPath: vscode.Uri, showTerminal: boolean, terminalColor: vscode.ThemeColor): void;

  // killEmailServer(): void {
  //   LoggingService.log(`Killing Email Server`);
  //   this.emailServerTerminal?.dispose();
  // }

  // showEmailServer(): void {
  //   this.emailServerTerminal?.show();
  // }
}
