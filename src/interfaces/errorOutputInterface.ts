export interface IErrorMessage {
	message: string;
	line: number;
	ignorable: boolean;
	identifier: string;
}