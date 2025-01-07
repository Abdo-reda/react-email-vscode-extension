import {
  runCommandInBackground,
  runCommandSync,
} from "../../utilities/vscodeUtilities";
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
  
  getCommandFormat(command: string): string {
      return `npm exec -y -- ${command}`;
  }
}
