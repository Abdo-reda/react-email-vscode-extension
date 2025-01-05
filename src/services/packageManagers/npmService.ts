import * as vscode from "vscode";
import {
  runCommandInBackground,
  runCommandSync,
  spawnProcess,
} from "../../utilities/vscodeUtilities";
import { LoggingService } from "../loggingService";
import { BasePackageManagerService } from "./basePackageManagerService";
import { PackageManagerEnum } from "../../constants/packageManagerEnum";
import { ISimplePackage } from "../../interfaces/simplePackageInterface";
import { IRenderEmail } from "../../interfaces/renderEmailOutput";

export class NpmService extends BasePackageManagerService {
  packageManager = PackageManagerEnum.NPM;

  checkInstalled(): boolean {
    try {
      const output = runCommandSync("npm --version");
      LoggingService.log(`Found npm version ${output.trim()}`);
      return true;
    } catch (error) {
      return false;
    }
  }

  setupEmailServerProject(
    cwd: string | undefined,
    errorCallback: (output: string) => void = () => {},
    successCallback: (output: string) => void = () => {}
  ): void {
    runCommandInBackground(
      `npm exec -y -- degit Abdo-reda/react-email-render-template#main project --force`,
      cwd,
      errorCallback,
      successCallback
    );
  }

  runRenderScript(cwd: string | undefined, successCallback: (output: IRenderEmail) => void, errorCallback: (error: unknown) => void): void {
    if (this.isRenderScriptRunning()) {
      LoggingService.log('Render Script already running!');
      return;
    }
    LoggingService.log(`Spawning npm Email Script Process Terminal 'npm exec -y -- tsx watch script'`);
    this.emailScriptTerminal = vscode.window.createTerminal({
      cwd: cwd,
      name: "react-email-renderer script",
      hideFromUser: showTerminal,
      color: terminalColor,
      iconPath: new vscode.ThemeIcon("server-process")
    });
    this.emailScriptTerminal.show(); //TODO: remove later
    this.emailScriptTerminal.sendText("npm exec -y -- tsx watch script", true);
  }

  // runRenderScript(cwd: string | undefined, successCallback: (output: IRenderEmail) => void, errorCallback: (error: unknown) => void): void {
  //   if (this.isRenderScriptRunning()) {
  //     LoggingService.log('Render Script already running!');
  //     return;
  //   }
  //   this.emailRenderScriptProcess = spawnProcess("npm exec -y -- tsx watch script", [], cwd); //TODO: use terminal instead ;)
  //   this.emailRenderScriptProcess.stdout?.on('data', (buffer: Buffer) => {
  //     const parsedOutput = JSON.parse(buffer.toString('utf-8')) as IRenderEmail;
  //     successCallback(parsedOutput);
  //   });

  //   this.emailRenderScriptProcess.stderr?.on('data', (buffer: Buffer) => {
  //     errorCallback(buffer.toString('utf-8'));
  //   });
  // }

  installPackages(
    packages: ISimplePackage[],
    cwd: string | undefined,
    errorCallback: (output: string) => void = () => {},
    successCallback: (output: string) => void = () => {}
  ): void {
    const packageCommand = packages.reduce((prev, cur) => {
      return `${prev} ${cur.name}@${cur.version}`;
    }, "");
    runCommandInBackground(
      `npm install --prefix ./ ${packageCommand} -E`,
      cwd,
      errorCallback,
      successCallback
    );
  }

  runEmailServer(port: number, projectPath: vscode.Uri, showTerminal: boolean, terminalColor: vscode.ThemeColor) {
    if (this.isEmailServerRunning()) {
      LoggingService.log('Rendering Server already running!');
      return;
    }
    LoggingService.log(`Spawning npm Email Server Process Terminal 'npm exec -- vite --port=${port}'`);
    this.emailServerTerminal = vscode.window.createTerminal({
      cwd: projectPath,
      name: "react-email-renderer server",
      hideFromUser: showTerminal,
      color: terminalColor,
      iconPath: new vscode.ThemeIcon("server-process")
    });
    this.emailServerTerminal.show(); //TODO: remove later
    this.emailServerTerminal.sendText(`npm exec -- vite --port=${port}`, true);
  }
}
