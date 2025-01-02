import { IExtensionConfiguration } from "../interfaces/extensionConfigurationInterface";
import { DependenciesEnum } from "./dependenciesEnum";
import { PackageManagerEnum } from "./packageManagerEnum";
import { RenderApproachEnum } from "./renderApproachEnum";
import { RenderOnEnum } from "./renderOnEnum";

const LATEST = "latest";
const DEFAULT_EXTENSION_URI = "extensionUri:";
const DEFAULT_SERVER_PORT = 7777;
const DEFAULT_TERMINAL_COLOR = "terminal.ansiCyan";

export class ExtensionConfiguration implements IExtensionConfiguration {
	renderApproach = RenderApproachEnum.SERVER;
	dependencies = DependenciesEnum.EXTERNAL;
	renderOn = RenderOnEnum.ON_SAVE;
	packageManager = PackageManagerEnum.NPM;
	packages =  {
	  directory: DEFAULT_EXTENSION_URI,
	  reactEmailRenderVersion: LATEST,
	  reactEmailComponentsVersion: LATEST,
	  reactVersion: LATEST,
	  reactDomVersion: LATEST,
	};
	server = {
	  port: DEFAULT_SERVER_PORT,
	  terminalColor: DEFAULT_TERMINAL_COLOR,
	  terminalVisibility: true,
	};
}

export const DEFAULT_CONFIGURATION = new ExtensionConfiguration();