import { PackageManagerEnum } from "../constants/packageManagerEnum";
import { RenderOnEnum } from "../constants/renderOnEnum";


export interface IExtensionConfiguration {
	renderOn: RenderOnEnum;
	packageManager: PackageManagerEnum;
	packages: {
		reactEmailVersion: string,
	};
}