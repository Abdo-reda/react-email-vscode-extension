import {
    runCommandInBackground,
    runCommandSync,
  } from "../../utilities/vscodeUtilities";
  import { LoggingService } from "../loggingService";
  import { BasePackageManagerService } from "./basePackageManagerService";
  import { PackageManagerEnum } from "../../constants/packageManagerEnum";
  import { ISimplePackage } from "../../interfaces/simplePackageInterface";
  
  export class BunService extends BasePackageManagerService {
    packageManager = PackageManagerEnum.BUN;
  
    checkInstalled(): boolean {
      try {
        const output = runCommandSync("bun --version");
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
        `bun add --cwd ./ ${packageCommand} --exact`,
        cwd,
        errorCallback,
        successCallback
      );
    }
    
    getCommandFormat(command: string): string {
        return `bunx ${command}`;
    }
  }
  