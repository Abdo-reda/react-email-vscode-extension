import { IPackageManagerService } from "../../interfaces/packageManagerServiceInterface";
import { IPackageRegistry } from "../../interfaces/packageRegistryInterface";
import { PackageManagerEnum } from "../../constants/packageManagerEnum";
import { ISimplePackage } from "../../interfaces/simplePackageInterface";
import { runCommandInBackground } from "../../utilities/vscodeUtilities";
import { LoggingService } from "../loggingService";

export abstract class BasePackageManagerService implements IPackageManagerService {
  abstract packageManager: PackageManagerEnum;
  private packageVersions = new Map<string, string[]>(); //TODO: cache in global state or something

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

  executeCommand(
    command: string,
    cwd: string | undefined,
    errorCallback: (output: string) => void = () => {},
    successCallback: (output: string) => void = () => {}
  ): void {
    LoggingService.log(`Package Manager ${this.packageManager} Executing command '${this.getCommandFormat(command)}'`);
    runCommandInBackground(
      this.getCommandFormat(command),
      cwd,
      errorCallback,
      successCallback
    );
  }

  abstract checkInstalled(): boolean;
  abstract getCommandFormat(command: string): string;
  abstract installPackages(
    _packages: ISimplePackage[],
    _cwd: string | undefined,
    _errorCallback?: (output: string) => void,
    _successCallback?: (output: string) => void
  ): void;
}
