import { PackagesEnum } from "../constants/packagesEnum";

export interface ISimplePackage {
    name: PackagesEnum,
    version: string;
}