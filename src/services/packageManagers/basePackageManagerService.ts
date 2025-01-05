import * as vscode from "vscode";
import { IPackageManagerService } from "../../interfaces/packageManagerServiceInterface";
import { IPackageRegistry } from "../../interfaces/packageRegistryInterface";
import { LoggingService } from "../loggingService";
import { PackageManagerEnum } from "../../constants/packageManagerEnum";
import { ISimplePackage } from "../../interfaces/simplePackageInterface";
import { IRenderEmail } from "../../interfaces/renderEmailOutput";
import { ChildProcess } from "child_process";
import { RenderApproachEnum } from "../../constants/renderApproachEnum";

export abstract class BasePackageManagerService implements IPackageManagerService {
  abstract packageManager: PackageManagerEnum;
  abstract renderApproach: RenderApproachEnum;
  abstract projectPath: vscode.Uri;
  abstract scriptSuccess: (output: string) => void;
  abstract scriptError: (output: string) => void;
  abstract serverSuccess: (output: IRenderEmail) => void;
  abstract serverError: (error: unknown) => void;
  renderTerminal: vscode.Terminal | undefined;

  private packageVersions = new Map<string, string[]>(); //TODO: cache in global state or something

  // emailRenderScriptProcess: ChildProcess | undefined;
  // emailScriptTerminal: vscode.Terminal | undefined;
  // emailScriptTerminal: vscode.Terminal | undefined;

  init(renderApproach: RenderApproachEnum, projectPath: vscode.Uri, scriptSuccess: (output: string) => void, scriptError: (output: string) => void, serverSuccess: (output: IRenderEmail) => void, serverError: (error: unknown) => void): void {
    this.renderApproach = renderApproach;
    this.projectPath = projectPath;
    this.scriptSuccess = scriptSuccess;
    this.scriptError = scriptError;
    this.serverSuccess = serverSuccess;
    this.serverError = serverError;
  }

  /**
   * Retrieves the package metadata from npm registry. Does not depend on package manager, they all reference the same registry.
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

  switchRenderApproach(renderApproach: RenderApproachEnum): void {
    this.renderApproach = renderApproach;
    // this.restartEmailServer();
  }

  isTerminalRunning(): boolean {
    if (!this.renderTerminal) return false;
    return !this.renderTerminal.exitStatus;
  }

  runRenderTerminal(): void {}

  async restartEmailServer(port: number, projectPath: vscode.Uri, showTerminal: boolean, terminalColor: vscode.ThemeColor) {
    await this.killEmailServer();
    this.runEmailServer(port, projectPath, showTerminal, terminalColor);
  }

  // isEmailServerRunning(): boolean {
  //   if (!this.emailServerTerminal) return false;
  //   return !this.emailServerTerminal.exitStatus;
  // }

  // isRenderScriptRunning(): boolean {
  //   if (!this.emailScriptTerminal) return false;
  //   return !this.emailScriptTerminal.exitStatus;
  // }

  // isRenderScriptRunning(): boolean {
  //   if (!this.emailRenderScriptProcess) return false;
  //   return !this.emailRenderScriptProcess.killed;
  // }

  async killEmailServer() {
    LoggingService.log(`Killing Email Server`);
    await this.emailServerTerminal?.dispose();
  }

  showEmailServer(): void {
    this.emailServerTerminal?.show();
  }

  async killRenderScript() {
    LoggingService.log(`Killing Script Server`);
    await this.emailScriptTerminal?.dispose();
  }

  // killRenderScript():void {
  //   LoggingService.log(`Killing Script Server`);
  //   if (!this.emailRenderScriptProcess) return;
  //   const result = this.emailRenderScriptProcess.kill();
  //   if (!result) {
  //     LoggingService.warn("There was an error killing the render script process.");
  //     return;
  //   }
  //   LoggingService.log("Killed render script process successffully.");
  //   this.emailRenderScriptProcess = undefined;
  // }

  abstract setupEmailServerProject(_cwd: string | undefined, _errorCallback?: (output: string) => void, _successCallback?: (output: string) => void): void;
  abstract runRenderScript(cwd: string | undefined, _successCallback: (output: IRenderEmail) => void, _errorCallback: (error: unknown) => void): void;
  abstract checkInstalled(): boolean;
  abstract installPackages(_packages: ISimplePackage[], _cwd: string | undefined, _errorCallback?: (output: string) => void, _successCallback?: (output: string) => void): void;
  abstract runEmailServer(port: number, projectPath: vscode.Uri, showTerminal: boolean, terminalColor: vscode.ThemeColor): void;
}
