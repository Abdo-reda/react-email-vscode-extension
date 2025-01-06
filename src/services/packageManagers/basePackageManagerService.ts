import * as vscode from "vscode";
import { IPackageManagerService } from "../../interfaces/packageManagerServiceInterface";
import { IPackageRegistry } from "../../interfaces/packageRegistryInterface";
import { LoggingService } from "../loggingService";
import { PackageManagerEnum } from "../../constants/packageManagerEnum";
import { ISimplePackage } from "../../interfaces/simplePackageInterface";
import { IRenderEmail } from "../../interfaces/renderEmailOutput";
import { RenderApproachEnum } from "../../constants/renderApproachEnum";
import { TerminalService } from "../terminalService";

export abstract class BasePackageManagerService implements IPackageManagerService {
  abstract packageManager: PackageManagerEnum;
  terminalService: TerminalService;
  renderApproach: RenderApproachEnum;
  projectPath: vscode.Uri;
  scriptSuccess: (output: string) => void;
  scriptError: (output: string) => void;
  serverSuccess: (output: IRenderEmail) => void;
  serverError: (error: unknown) => void;
  private packageVersions = new Map<string, string[]>(); //TODO: cache in global state or something

  constructor(
    terminalService: TerminalService,
    renderApproach: RenderApproachEnum,
    projectPath: vscode.Uri,
    scriptSuccess: (output: string) => void,
    scriptError: (output: string) => void,
    serverSuccess: (output: IRenderEmail) => void,
    serverError: (error: unknown) => void
  ) {
    this.terminalService = terminalService;
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
    this.runRenderTerminal();
  }

  runRenderTerminal(): void {
    if (this.renderApproach === RenderApproachEnum.SCRIPT) {
      this.runScriptTerminal();
    } else if (this.renderApproach === RenderApproachEnum.SERVER) {
      this.runServerTerminal();
    }
  }

  async restartRenderTerminal() {
    LoggingService.log(`Restarting ${this.renderApproach} Render Terminal`);
    await this.terminalService.restartTerminal();
  }

  showRenderTerminal(): void {
    this.terminalService.show();
  }

  setupExternalProject(
    cwd: string | undefined,
    errorCallback?: (output: string) => void,
    successCallback?: (output: string) => void
  ) {
    if (this.renderApproach === RenderApproachEnum.SCRIPT) {
      this.setupScriptProject(cwd, errorCallback, successCallback);
    } else if (this.renderApproach === RenderApproachEnum.SERVER) {
      this.setupServerProject(cwd, errorCallback, successCallback);
    }
  }

  abstract checkInstalled(): boolean;
  abstract installPackages(
    _packages: ISimplePackage[],
    _cwd: string | undefined,
    _errorCallback?: (output: string) => void,
    _successCallback?: (output: string) => void
  ): void;
  abstract runScriptTerminal(): void;
  abstract runServerTerminal(): void;
  abstract setupServerProject(
    _cwd: string | undefined,
    _errorCallback?: (output: string) => void,
    _successCallback?: (output: string) => void
  ): void;
  abstract setupScriptProject(
    _cwd: string | undefined,
    _errorCallback?: (output: string) => void,
    _successCallback?: (output: string) => void
  ): void;

  // async killRenderTerminal() {
  //   LoggingService.log(`Killing ${this.renderApproach} Render Terminal`);
  //   await this.renderTerminal?.dispose();
  // }

  // async restartEmailServer(port: number, projectPath: vscode.Uri, showTerminal: boolean, terminalColor: vscode.ThemeColor) {
  //   await this.killEmailServer();
  //   this.runEmailServer(port, projectPath, showTerminal, terminalColor);
  // }

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

  // async killEmailServer() {
  //   LoggingService.log(`Killing Email Server`);
  //   await this.emailServerTerminal?.dispose();
  // }

  // showEmailServer(): void {
  //   this.emailServerTerminal?.show();
  // }

  // async killRenderScript() {
  //   LoggingService.log(`Killing Script Server`);
  //   await this.emailScriptTerminal?.dispose();
  // }

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

  // abstract runRenderScript(cwd: string | undefined, _successCallback: (output: IRenderEmail) => void, _errorCallback: (error: unknown) => void): void;
  // abstract runEmailServer(port: number, projectPath: vscode.Uri, showTerminal: boolean, terminalColor: vscode.ThemeColor): void;
}
