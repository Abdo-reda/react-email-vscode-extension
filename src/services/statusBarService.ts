import * as vscode from "vscode";

//--- functionality
//- status bar
// (green, server is live, hover, tells you the server is live at what (url). --> opens the tab in case it was closed and shows the terminal.
// (red, server was unable to run) --> clicks, opens terminal/logs
// (grey, nothing is happening) --> runs the server and opens the tab - server is closed / ended

export class StatusBarService {
    private static _instance: StatusBarService;
    private statusBar: vscode.StatusBarItem;
    private static defaultColor: vscode.ThemeColor = new vscode.ThemeColor('statusBarItem.foreground');
    private static errorColor: vscode.ThemeColor = new vscode.ThemeColor('statusBarItem.errorForeground');
    private static successColor: vscode.ThemeColor = new vscode.ThemeColor('notebookStatusSuccessIcon.foreground');
    private static warnColor: vscode.ThemeColor = new vscode.ThemeColor('statusBarItem.warningForeground');

    constructor() {
        this.statusBar = this.createStatusBar();
    }

    private static get instance(): StatusBarService {
        if (!StatusBarService._instance) {
            StatusBarService._instance = new StatusBarService();
        }

        return StatusBarService._instance;
    }

    public static init(context: vscode.ExtensionContext)
    {
        this.setDefaultState();
        this.instance.setDefaultCommand();
        this.instance.statusBar.show();
        context.subscriptions.push(this.instance.statusBar);
    }

    private createStatusBar(): vscode.StatusBarItem {
        const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
        return statusBar;
    }

    public static setDefaultState(): void {
        this.instance.setDefaultCommand();
        this.instance.setDefaultToolTip();
        this.instance.statusBar.color = this.defaultColor;
        this.instance.statusBar.text = `$(react-email-default) react-email`;
    }
    
    public static setSuccessState(): void {
        this.instance.setDefaultCommand();
        this.instance.setSuccessToolTip();
        this.instance.statusBar.color = this.successColor;
        this.instance.statusBar.text = `$(react-email-success) react-email`;
    }
    
    public static setLoadingState(): void {
        this.instance.setDefaultCommand();
        this.instance.setLoadingToolTip();
        this.instance.statusBar.color = this.defaultColor;
        this.instance.statusBar.text = `$(loading~spin) react-email`;
    }

    public static setWarningState(): void {
        this.instance.setDefaultCommand();
        this.instance.setWarningToolTip();
        this.instance.statusBar.color = this.warnColor;
        this.instance.statusBar.text = `$(react-email-warn) react-email`;
    }
    
    public static setErrorState(): void {
        this.instance.setErrorCommand();
        this.instance.setErrorToolTip();
        this.instance.statusBar.color = this.errorColor;
        this.instance.statusBar.text = `$(react-email-error) react-email`;
    }
    
    private setDefaultCommand(): void 
    {
        this.statusBar.command = 'react-email-renderer.toggleRenderTerminal';
    }

    private setErrorCommand(): void
    {
        this.statusBar.command = 'react-email-renderer._showOutput'; 
    }

    private setErrorToolTip(): void {
        this.statusBar.tooltip = 'react email server was unable to run, is shell integration enabled? check logs'; 
    }

    private setWarningToolTip(): void {
        this.statusBar.tooltip = 'react email faced an error rendering the email'; 
    }

    private setDefaultToolTip(): void {
        this.statusBar.tooltip = 'react email server has stopped'; 
    }

    private setLoadingToolTip(): void {
        this.statusBar.tooltip = 'react email rendering ...';
    }

    private setSuccessToolTip(): void {
        const url = 'https://';
        this.statusBar.tooltip = `react email server running at ${url}`;
    }
}
