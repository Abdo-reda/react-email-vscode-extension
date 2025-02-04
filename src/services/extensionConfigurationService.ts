import { IExtensionConfiguration } from "../interfaces/extensionConfigurationInterface";
import { DependenciesEnum } from "../constants/dependenciesEnum";
import { PackageManagerEnum } from "../constants/packageManagerEnum";
import { RenderApproachEnum } from "../constants/renderApproachEnum";
import { RenderOnEnum } from "../constants/renderOnEnum";
import { PackagesEnum } from "../constants/packagesEnum";
import { getConfiguration } from "../utilities/vscodeUtilities";
import { ExtensionConfigurations } from "../constants/configurationEnum";
import { RuntimeEnviornmentEnum } from "../constants/runtimeEnvironmentEnum";

export const LATEST = "latest";
export const DEFAULT_EXTENSION_URI = "extensionUri:";
export const DEFAULT_SERVER_PORT = 7777;
export const DEFAULT_TERMINAL_COLOR = "terminal.ansiCyan";

export class ExtensionConfigurationService implements IExtensionConfiguration {
  renderApproach = RenderApproachEnum.SERVER;
  dependencies = DependenciesEnum.EXTERNAL;
  renderOn = RenderOnEnum.ON_SAVE;
  runtimeEnviornment = RuntimeEnviornmentEnum.NODE;
  packageManager = PackageManagerEnum.NPM;
  packages = {
    directory: DEFAULT_EXTENSION_URI,
    reactEmailRenderVersion: LATEST,
    reactEmailComponentsVersion: LATEST,
    reactVersion: LATEST,
    reactDomVersion: LATEST,
  };
  server = { //TODO: rename from server to terminal, update configuration
    port: DEFAULT_SERVER_PORT,
    terminalColor: DEFAULT_TERMINAL_COLOR,
    terminalVisible: false,
  };

  loadConfiguration(): void {
      this.renderApproach = getConfiguration(ExtensionConfigurations.RENDER_APPROACH, this.renderApproach);
      this.dependencies = getConfiguration(ExtensionConfigurations.DEPENDENCIES, this.dependencies);
      this.renderOn = getConfiguration(ExtensionConfigurations.RENDER_ON, this.renderOn);
      this.runtimeEnviornment = getConfiguration(ExtensionConfigurations.RUNTIME_ENVIORNMENT, this.runtimeEnviornment);
      this.packageManager = getConfiguration(ExtensionConfigurations.PACKAGE_MANAGER, this.packageManager);
      this.packages = {
        directory: getConfiguration(ExtensionConfigurations.DIRECTORY, this.packages.directory),
        reactEmailRenderVersion: getConfiguration(ExtensionConfigurations.REACT_EMAIL_RENDER_VERSION, this.packages.reactEmailRenderVersion),
        reactEmailComponentsVersion: getConfiguration(ExtensionConfigurations.REACT_EMAIL_COMPONENTS_VERSION, this.packages.reactEmailComponentsVersion),
        reactVersion: getConfiguration(ExtensionConfigurations.REACT_VERSION, this.packages.reactVersion),
        reactDomVersion: getConfiguration(ExtensionConfigurations.REACT_DOM_VERSION, this.packages.reactDomVersion),
      };
      this.server = {
        port: getConfiguration(ExtensionConfigurations.SERVER_PORT, this.server.port),
        terminalVisible: getConfiguration(ExtensionConfigurations.SERVER_TERMINAL_VISIBLE, this.server.terminalVisible),
        terminalColor: getConfiguration(ExtensionConfigurations.SERVER_TERMINAL_COLOR, this.server.terminalColor),
      };
  }

  getCurrentVisionOfPackage(packageName: PackagesEnum): string {
    switch (packageName) {
      case PackagesEnum.REACT:
        return this.packages.reactVersion;
      case PackagesEnum.REACT_DOM:
        return this.packages.reactDomVersion;
      case PackagesEnum.REACT_EMAIL_COMPONENTS:
        return this.packages.reactEmailComponentsVersion;
      case PackagesEnum.REACT_EMAIL_RENDER:
        return this.packages.reactEmailRenderVersion;
      default:
        return "latest";
    }
  }
}
