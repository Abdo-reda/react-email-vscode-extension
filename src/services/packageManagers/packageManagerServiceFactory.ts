import { PackageManagerEnum } from "../../constants/packageManagerEnum";
import { RenderApproachEnum } from "../../constants/renderApproachEnum";
import { IPackageManagerService } from "../../interfaces/packageManagerServiceInterface";
import { IRenderEmail } from "../../interfaces/renderEmailOutput";
import { LoggingService } from "../loggingService";
import { TerminalService } from "../terminalService";
import { NpmService } from "./npmService";

export class PackageManagerServiceFactory {
  static getService( //TODO: I don't like this, is there a better way?
    packageManager: PackageManagerEnum,
    terminalService: TerminalService,
    projectPath: vscode.uri,
    renderApproach: RenderApproachEnum,
    scriptSuccess: (output: string) => void,
    scriptError: (output: string) => void,
    serverSuccess: (output: IRenderEmail) => void,
    serverError: (error: unknown) => void
  ): IPackageManagerService {
    switch (packageManager) {
      case PackageManagerEnum.NPM:
        return new NpmService(terminalService,renderApproach, projectPath,  scriptSuccess, scriptError, serverSuccess, serverError);
        break;
      default:
        LoggingService.error(`Selected Package Manager ${packageManager} is not Supported`);
        throw new Error(`Selected Package Manager ${packageManager} is not Supported`);
    }
  }
}
