import * as vscode from "vscode";
import { runCommandInBackground, runCommandSync, spawnProcess } from "../../utilities/vscodeUtilities";
import { LoggingService } from "../loggingService";
import { BasePackageService } from "./basePackageService";
import { PackagesEnum } from "../../constants/packagesEnum";

//The possible approaches:
//1. make the user download and install the packages locally even if at --save-dev (would like to avoid)
//2. somehow make the npm packages resolved from the node_modules downloaded from npx ...
  //+ how can I do this?
//3. create a small project with just the email server 

export class NpmService extends BasePackageService {
  checkVersion(): boolean {
    try {
      const output = runCommandSync("npm --version");
      LoggingService.log(`Found npm version ${output.trim()}`);
      return true;
    } catch (error) {
      return false;
    }
  }

  runEmailServer(port: string, projectPath: vscode.Uri) {
    LoggingService.log(`Spawning npm Email Server Process Terminal 'npm exec -- react-email dev --port ${port}'`);
    this.emailServerTerminal = vscode.window.createTerminal({
      cwd: projectPath,
      name: "react-email server",
      hideFromUser: true,
    });
    this.emailServerTerminal.show(); //TODO: remove later
    this.emailServerTerminal.sendText(`npm exec -- react-email dev --port ${port}`);
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

  downloadPackage(name: string, version: string): boolean {
    try {
      const output = runCommandInBackground(`npm pack ${name}@${version}`);
      return true;
    } catch (error) {
      return false;
    }
  }

  installPackage(name: string, version: string, cwd: string | undefined): boolean {
    try {
      const output = runCommandSync(`npm install --prefix ./ ${name}@${version} -E`, cwd); //TODO: this should be done in the background.
      const otherOutput = runCommandSync(`npm install --prefix ./ @react-email/components react react-dom -E`, cwd); //TODO: this should be done in the background.
      //TODO: we will need 4 version settings. react-email, reactemail-componetns, react, react-dom
      return true;
    } catch (error) {
      console.error('---- unable to install?', error)
      return false;
    }
  }
}
