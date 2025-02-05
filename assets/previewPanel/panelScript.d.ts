interface vscode {
    postMessage(message: any): void;
}
declare function acquireVsCodeApi(): vscode;
declare const vscode: vscode;
declare const mainDiv: HTMLElement;
declare function replaceMainContent(html: string): void;
declare function listenToVscodeMessages(): void;
