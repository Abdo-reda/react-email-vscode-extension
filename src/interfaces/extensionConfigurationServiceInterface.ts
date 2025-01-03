import { PackagesEnum } from "../constants/packagesEnum";
import { IExtensionConfiguration } from "./extensionConfigurationInterface";

export interface IExtensionConfigurationService extends IExtensionConfiguration {
    loadConfiguration(): void;
    getCurrentVisionOfPackage(packageName: PackagesEnum): string;
}