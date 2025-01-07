import { PackagesEnum } from "./packagesEnum";

export enum ExtensionConfigurations {
    RENDER_APPROACH = "renderApproach",
    DEPENDENCIES = "dependencies",
    RUNTIME_ENVIORNMENT = "runtimeEnviornment",
    PACKAGE_MANAGER = "packageManager",
    RENDER_ON = "renderOn",
    DIRECTORY = "packages.directory",
    REACT_EMAIL_RENDER_VERSION = "packages.reactEmailRenderVersion", 
    REACT_EMAIL_COMPONENTS_VERSION = "packages.reactEmailComponentsVersion", 
    REACT_VERSION = "packages.reactVersion", 
    REACT_DOM_VERSION = "packages.reactDomVersion", 
    SERVER_PORT = "server.port", 
    SERVER_TERMINAL_VISIBILITY = "server.terminalVisibility", 
    SERVER_TERMINAL_COLOR = "server.terminalColor", 
}

export const PACKAGE_CONFIGURATION_MAP = new Map<PackagesEnum, ExtensionConfigurations>([
    [PackagesEnum.REACT, ExtensionConfigurations.REACT_VERSION],
    [PackagesEnum.REACT_DOM, ExtensionConfigurations.REACT_DOM_VERSION],
    [PackagesEnum.REACT_EMAIL_COMPONENTS, ExtensionConfigurations.REACT_EMAIL_COMPONENTS_VERSION],
    [PackagesEnum.REACT_EMAIL_RENDER, ExtensionConfigurations.REACT_EMAIL_RENDER_VERSION],
]);