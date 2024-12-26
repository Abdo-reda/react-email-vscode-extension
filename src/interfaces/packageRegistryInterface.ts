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

// "_id": "@react-email/render",
// "_rev": "38-0536aeb209dd2c276e27751c87163a38",
// "name": "@react-email/render",
// "dist-tags": {
//   "latest": "1.0.3",
//   "alpha": "1.0.3-alpha-f49712983-20241115",
//   "canary": "1.0.3-canary.3"
// },
// "versions": {
//   "0.0.1": {
//     "name": "@react-email/render",
//     "version": "0.0.1",
//     "license": "MIT",
//     "_id": "@react-email/render@0.0.1",
//     "maintainers": [
//       {
//         "name": "bukinoshita",
//         "email": "bukinoshita@gmail.com"
//       },
//       {
//         "name": "zenorocha",
//         "email": "zno.rocha@gmail.com"
//       }
//     ],
//     "dist": {