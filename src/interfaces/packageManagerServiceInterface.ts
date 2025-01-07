import { PackageManagerEnum } from "../constants/packageManagerEnum";
import { ISimplePackage } from "./simplePackageInterface";

export interface IPackageManagerService {
  packageManager: PackageManagerEnum;

  checkInstalled(): boolean;
  installPackages(packages: ISimplePackage[], cwd: string | undefined, errorCallback?: (output: string) => void, successCallback?: (output: string) => void): void;
  getPackageVersions(version: string): Promise<string[]>;
  isValidPackageVersion(name: string, version: string): Promise<boolean>;
  executeCommand(
    command: string,
    cwd: string | undefined,
    errorCallback: (output: string) => void,
    successCallback: (output: string) => void
  ): void;
  getCommandFormat(command: string): string;
}
