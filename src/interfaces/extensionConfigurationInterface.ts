import { DependenciesEnum } from "../constants/dependenciesEnum";
import { PackageManagerEnum } from "../constants/packageManagerEnum";
import { RenderApproachEnum } from "../constants/renderApproachEnum";
import { RenderOnEnum } from "../constants/renderOnEnum";

export interface IExtensionConfiguration {
	renderApproach: RenderApproachEnum;
	dependencies: DependenciesEnum;
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
		terminalVisibility: boolean,
		terminalColor: string,
	};
}
