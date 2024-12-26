import * as vscode from "vscode";

export class StatusBarService {
    private statusBar: vscode.StatusBarItem;
    private defaultColor: vscode.ThemeColor;
    private errorColor: vscode.ThemeColor;
    private successColor: vscode.ThemeColor;

    constructor() {
        this.statusBar = this.createStatusBar();
        this.defaultColor = new vscode.ThemeColor('statusBarItem.foreground');
        this.errorColor = new vscode.ThemeColor('errorForeground');
        this.successColor = new vscode.ThemeColor('notebookStatusSuccessIcon.foreground');
    }

    public initStatusBar(): vscode.StatusBarItem 
    {
        this.setDefaultState();
        this.setDefaultCommand();
        this.statusBar.show();
        return this.statusBar;
    }
    
    private setDefaultCommand(): void 
    {
        this.statusBar.command = 'react-email._showOutput';
    }

    private setErrorCommand(): void
    {
        this.statusBar.command = "workbench.action.problems.focus"; 
    }

    private createStatusBar(): vscode.StatusBarItem {
        const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
        return statusBarItem;
    }

    public setSuccessState(): void {
        this.setDefaultCommand();
        this.setSuccessToolTip();
        this.statusBar.color = this.successColor;
        this.statusBar.text = `$(react-email-success)`;
    }
    
    public setDefaultState(): void {
        this.setDefaultCommand();
        this.setDefaultToolTip();
        this.statusBar.color = this.defaultColor;
        this.statusBar.text = `$(react-email-default)`;
    }
    
    public setLoadingState(): void {
        this.setDefaultCommand();
        this.setLoadingToolTip();
        this.statusBar.color = this.defaultColor;
        this.statusBar.text = `$(loading~spin)`;
    }
    
    public setErrorState(): void {
        this.setErrorCommand();
        this.statusBar.color = this.errorColor;
        this.statusBar.text = `$(react-email-error)`;
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
