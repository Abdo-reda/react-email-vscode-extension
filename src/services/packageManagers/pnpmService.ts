import {
  runCommandInBackground,
  runCommandSync,
} from "../../utilities/vscodeUtilities";
import { LoggingService } from "../loggingService";
import { BasePackageManagerService } from "./basePackageManagerService";
import { PackageManagerEnum } from "../../constants/packageManagerEnum";
import { ISimplePackage } from "../../interfaces/simplePackageInterface";

export class PnpmService extends BasePackageManagerService {
  packageManager = PackageManagerEnum.PNPM;

  checkInstalled(): boolean {
    try {
      const output = runCommandSync("pnpm --version");
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
      `pnpm add --dir ./ ${packageCommand} --save-exact`,
      cwd,
      errorCallback,
      successCallback
    );
  }
  
  getCommandFormat(command: string): string {
      return `pnpm dlx ${command}`;
  }
}
