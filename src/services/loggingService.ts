import * as vscode from "vscode";

export class LoggingService {
    private static _instance: LoggingService;
    private outputChannel: vscode.LogOutputChannel;

    private constructor() {
        this.outputChannel = vscode.window.createOutputChannel('React Email', {log: true});
    }

    private static get instance(): LoggingService {
        if (!LoggingService._instance) {
            LoggingService._instance = new LoggingService();
        }

        return LoggingService._instance;
    }

    public static show(): void {
        this.instance.outputChannel.show();
    }

    public static log(message: string, ...args: any[]): void {
        this.instance.outputChannel.info(`${message}`);
        console.log(`[react-email]: ${message}`, ...args);
    }

    public static warn(message: string, ...args: any[]): void {
        this.instance.outputChannel.warn(`${message}`);
        console.warn(`[react-email]: ${message}`, ...args);
    }

    public static error(message: string, ...args: any[]): void {
        this.instance.outputChannel.error(`${message}`);
        console.error(`[react-email]: ${message}`, ...args);
    }
}