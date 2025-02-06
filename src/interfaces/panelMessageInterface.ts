import { PreviewPanelCommandEnum } from "../constants/previewPanelCommandEnum";

export interface IPanelMessage<T> {
    command: PreviewPanelCommandEnum;
    data: T;
}

export type IPanelHtmlMessage = IPanelMessage<IPanelHtmlContent>;

export interface IPanelHtmlContent {
    html: string;
}