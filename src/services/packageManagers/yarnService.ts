import {
  runCommandInBackground,
  runCommandSync,
} from "../../utilities/vscodeUtilities";
import { LoggingService } from "../loggingService";
import { BasePackageManagerService } from "./basePackageManagerService";
import { PackageManagerEnum } from "../../constants/packageManagerEnum";
import { ISimplePackage } from "../../interfaces/simplePackageInterface";

export class YarnService extends BasePackageManagerService {
  packageManager = PackageManagerEnum.YARN;

  checkInstalled(): boolean {
    try {
      const output = runCommandSync("yarn --version");
      LoggingService.log(`Found ${this.packageManager} version ${output.trim()}`);
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
      `yarn add --cwd ./ ${packageCommand} --exact`,
      cwd,
      errorCallback,
      successCallback
    );
  }
  
  getCommandFormat(command: string): string {
      return `yarn dlx ${command}`;
  }
}
