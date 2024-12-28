import * as vscode from "vscode";
import { runCommandInBackground, runCommandSync, spawnProcess } from "../../utilities/vscodeUtilities";
import { LoggingService } from "../loggingService";
import { BasePackageManagerService } from "./basePackageManagerService";
import { PackageManagerEnum } from "../../constants/packageManagerEnum";
import { ISimplePackage } from "../../interfaces/simplePackageInterface";

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

  runEmailServer(port: number, projectPath: vscode.Uri, showTerminal: boolean, terminalColor: vscode.ThemeColor) {
    LoggingService.log(`Spawning npm Email Server Process Terminal 'npm exec -- react-email dev --port ${port}'`);
    this.emailServerTerminal = vscode.window.createTerminal({
      cwd: projectPath,
      name: "react-email server",
      hideFromUser: showTerminal,
      color: terminalColor,
    });
    this.emailServerTerminal.show(); //TODO: remove later
    this.emailServerTerminal.sendText(`npm exec -- react-email dev --port ${port}`);
  }

  downloadPackage(name: string, version: string): boolean {
    try {
      const output = runCommandInBackground(`npm pack ${name}@${version}`);
      return true;
    } catch (error) {
      return false;
    }
  }

  installPackages(packages: ISimplePackage[], cwd: string | undefined, errorCallback: (output: string) => void = () => {}, successCallback: (output: string) => void = () => {}): void {
    const packageCommand = packages.reduce((prev, cur) => {
      return `${prev} ${cur.name}@${cur.version}`;
    }, "");
    runCommandInBackground(`npm install --prefix ./ ${packageCommand} -E`, cwd, errorCallback, successCallback);
  }

  // runEmailServer(version: string, port: string, cwd: string | undefined) {
  //   LoggingService.log(`Spawning npm Email Server Process Terminal 'npm exec --cache project -y -- react-email@${version} dev --port ${port}'`);
  //   this.emailServerTerminal = vscode.window.createTerminal({
  //     cwd: cwd,
  //     name: "react-email server",
  //     hideFromUser: true,
  //   });
  //   this.emailServerTerminal.show(); //TODO: remove later
  //   this.emailServerTerminal.sendText(`npm exec --cache project -y -- react-email@${version} dev --port ${port}`);
  // }

  // runEmailServer(version: string, port: string, cwd: string|undefined) {
  //   try {
  //     LoggingService.log(`Spawning npm Email Server Process`);
  //     this.emailServer = spawnProcess(`npm exec -y -- react-email@${version} dev --port ${port}`, [], cwd);
  //     return true;
  //   } catch (error) {
  //     return false;
  //   }
  // }
}
