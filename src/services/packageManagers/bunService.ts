// import { runCommandSync, spawnProcess } from "../../utilities/vscodeUtilities";
// import { LoggingService } from "../loggingService";
// import { BasePackageService } from "./basePackageService";

// export class BunService extends BasePackageService {

//   checkVersion(): boolean {
//     try {
//       const output = runCommandSync('bun --version');
//       LoggingService.log(`Found bun version ${output}`);
//       return true;
//     } catch (error) {
//       return false;
//     }
//   }

//   runEmailServer(version: string, port: string) {
//     try {
//       LoggingService.log(`Spawning bun Email Server Process`);
//       this.emailServer = spawnProcess(`bun x react-email@${version} dev --port ${port}`);
//       return true;
//     } catch (error) {
//       return false;
//     }
//   }

//   downloadPackage(_name: string, _version: string): boolean {
//     return false;
//   }

//   installPackage(_name: string, _version: string): boolean {
//     return false;
//   }
// }
