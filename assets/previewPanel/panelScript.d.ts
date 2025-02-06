interface vscode {
    postMessage(message: any): void;
}
declare function acquireVsCodeApi(): vscode;
declare let currentZoom: number;
declare const vscode: vscode;
declare const mainDiv: HTMLElement;
declare const toolbarDiv: HTMLElement;
declare function replaceMainContent(html: string): void;
declare function replaceToolbarContent(html: string): void;
declare function handleCommand(command: string): void;
declare function zoomFunc(): void;
declare function listenToVscodeMessages(): void;
