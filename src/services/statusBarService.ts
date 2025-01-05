import * as vscode from "vscode";

export class StatusBarService {
    private statusBar: vscode.StatusBarItem;
    private static _instance: StatusBarService;
    private static defaultColor: vscode.ThemeColor = new vscode.ThemeColor('statusBarItem.foreground');
    private static errorColor: vscode.ThemeColor = new vscode.ThemeColor('errorForeground');
    private static successColor: vscode.ThemeColor = new vscode.ThemeColor('notebookStatusSuccessIcon.foreground');

    //TODO: update status bar states.
        //- running server/script
        //- success from script?
        //- error from script?
        //- success from server?!?
        //- error from server?!?
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

    public static setDefaultState(): void {
        this.instance.setDefaultCommand();
        this.instance.setDefaultToolTip();
        this.instance.statusBar.color = this.defaultColor;
        this.instance.statusBar.text = `$(react-email-default)`;
    }
    
    public static setSuccessState(): void {
        this.instance.setDefaultCommand();
        this.instance.setSuccessToolTip();
        this.instance.statusBar.color = this.successColor;
        this.instance.statusBar.text = `$(react-email-success)`;
    }
    
    public static setLoadingState(): void {
        this.instance.setDefaultCommand();
        this.instance.setLoadingToolTip();
        this.instance.statusBar.color = this.defaultColor;
        this.instance.statusBar.text = `$(loading~spin)`;
    }
    
    public static setErrorState(): void {
        this.instance.setErrorCommand();
        this.instance.statusBar.color = this.errorColor;
        this.instance.statusBar.text = `$(react-email-error)`;
    }
    
    private setDefaultCommand(): void 
    {
        this.statusBar.command = 'react-email-renderer._showOutput';
    }

    private setErrorCommand(): void
    {
        this.statusBar.command = "workbench.action.problems.focus"; 
    }

    private createStatusBar(): vscode.StatusBarItem {
        const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
        return statusBar;
    }

    private setDefaultToolTip(): void {
        this.statusBar.tooltip = ''; 
    }

    private setLoadingToolTip(): void {
        this.statusBar.tooltip = 'react email rendering ...';
    }

    private setSuccessToolTip(): void {
        this.statusBar.tooltip = 'No errors were found.';
    }
}
