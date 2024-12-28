export interface IPackageRegistry {
    _id: string;
    _rev: string;
    name: string;
    "dist-tags": IPacakgeDistTags;
    versions: IPackageVersion[];
}

interface IPackageVersion {
    [key:string]: {
        name: string;
        version: string;
        _id: string;
    } 
}

interface IPacakgeDistTags {
    latest: string;
}
