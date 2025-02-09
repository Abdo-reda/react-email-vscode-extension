import { PackageManagerEnum } from "../../constants/packageManagerEnum";
import { IPackageManagerService } from "../../interfaces/packageManagerServiceInterface";
import { LoggingService } from "../loggingService";
import { NpmService } from "./npmService";
import { PnpmService } from "./pnpmService";
import { YarnService } from "./yarnService";

export class PackageManagerServiceFactory {
  static getService(
    packageManager: PackageManagerEnum,
  ): IPackageManagerService {
    switch (packageManager) {
      case PackageManagerEnum.NPM:
        return new NpmService();
      case PackageManagerEnum.YARN:
        return new YarnService();
      case PackageManagerEnum.PNPM:
        return new PnpmService();
      default:
        LoggingService.error(`Selected Package Manager ${packageManager} is not Supported`);
        throw new Error(`Selected Package Manager ${packageManager} is not Supported`);
    }
  }
}
