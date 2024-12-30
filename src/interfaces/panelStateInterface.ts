import { IRenderEmail } from "./renderEmailOutput";

export interface IPanelState {
	emailTitle: string;
	emailOutput: IRenderEmail;
	emailErrors: string;
}