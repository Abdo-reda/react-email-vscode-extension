import { DependenciesEnum } from "../constants/dependenciesEnum";
import { PackageManagerEnum } from "../constants/packageManagerEnum";
import { RenderApproachEnum } from "../constants/renderApproachEnum";
import { RenderOnEnum } from "../constants/renderOnEnum";
import { RuntimeEnviornmentEnum } from "../constants/runtimeEnvironmentEnum";

export interface IExtensionConfiguration {
	renderApproach: RenderApproachEnum;
	dependencies: DependenciesEnum;
	runtimeEnviornment: RuntimeEnviornmentEnum;
	packageManager: PackageManagerEnum;
	renderOn: RenderOnEnum;
	packages: {
		directory: string,
		reactEmailRenderVersion: string,
		reactEmailComponentsVersion: string,
		reactVersion: string,
		reactDomVersion: string,
	};
	server: {
		port: number,
		terminalVisible: boolean,
		terminalColor: string,
	};
}
