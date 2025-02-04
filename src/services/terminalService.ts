import * as vscode from "vscode";
import { LoggingService } from "./loggingService";

interface ITerminalExecutionConfig {
  cwd: vscode.Uri | undefined;
  command: string;
  onOutput: (output: string) => void;
}

//TODO: make this a singleton if it will only mange a single terminal 
/**
 * Manages and Creates A Single Terminal Instance.
 */
export class TerminalService {
  private terminal: vscode.Terminal | undefined;
  private visibility: boolean = false;
  private icon!: vscode.ThemeIcon;
  private color!: vscode.ThemeColor;
  private activeExecution: boolean = false;
  private terminalExecutionConfig: ITerminalExecutionConfig = {
    cwd: undefined,
    command: "",
    onOutput: () => {},
  };
  private resetTerminal = false;
  private isVisible = false;

  init(context: vscode.ExtensionContext, visibility: boolean, icon: vscode.ThemeIcon, color: vscode.ThemeColor) {
    this.resetTerminal = true;
    this.visibility = visibility;
    this.icon = icon;
    this.color = color;
    this.setupListeners(context);
  }

  async runTerminal(command: string, cwd: vscode.Uri, onOutput: (output: string) => void = () => {}): Promise<boolean> {
    const oldCWD = this.terminalExecutionConfig.cwd?.fsPath;
    const oldCommand = this.terminalExecutionConfig.command;
    this.terminalExecutionConfig = {
      cwd: cwd,
      command: command,
      onOutput: onOutput,
    };
    if (this.resetTerminal || oldCWD !== cwd.fsPath) {
      await this.createTerminal(cwd);
      return true;
    }
    if (oldCommand !== command || !this.activeExecution) {
      this.executeCommand(); //TODO: should I use await?
      return true;
    }
    return false;
  }

  async restartTerminal() {
    if (!this.terminalExecutionConfig.cwd) return;
    LoggingService.log("Restarting Terminal");
    await this.createTerminal(this.terminalExecutionConfig.cwd);
  }

  toggleVisibility() {
    this.isVisible = !this.isVisible;
    if (this.isVisible) this.show();
    else this.hide();
  }

  show() {
    this.terminal?.show(true);
  }

  hide() {
    this.terminal?.hide();
  }

  setVisiblity(show: boolean) {
    this.visibility = show;
    this.resetTerminal = true;
  }

  setIcon(icon: vscode.ThemeIcon) {
    this.icon = icon;
    this.resetTerminal = true;
  }

  setColor(color: vscode.ThemeColor) {
    this.color = color;
    this.resetTerminal = true;
  }

  private async createTerminal(cwd: vscode.Uri, name: string = "react-email-renderer") {
    LoggingService.log(`Creating Terminal ${name} at ${cwd.fsPath}`);
    await this.killTerminal();
    this.resetTerminal = false;
    this.terminal = vscode.window.createTerminal({
      cwd: cwd,
      name: name,
      hideFromUser: !this.visibility,
      color: this.color,
      iconPath: this.icon, //custom icons
    });
    this.isVisible = this.visibility;
    // this.terminal.show(true); //TODO: remove later

    // this.terminal.sendText(command, true); //TODO: what if shell integration is not enabled? is this the right way of handling this? should I just return to sendingText and using node child process ... I hate everything >.<
  }

  private setupListeners(context: vscode.ExtensionContext) {
    const changeDisposable = vscode.window.onDidChangeTerminalShellIntegration(async (event) => {
      LoggingService.log(`Shell Integration Enabled for terminal '${event.terminal.name}'`);
      if (event.terminal !== this.terminal || this.activeExecution) return;
      this.executeCommand();
    });

    const endDisposable = vscode.window.onDidEndTerminalShellExecution((event) => {
      if (event.terminal !== this.terminal) return;
      LoggingService.log("Terminal process execution ended");
      this.activeExecution = false;
    });

    const closeDisposable = vscode.window.onDidCloseTerminal((terminal) => {
      if (terminal !== this.terminal) return;
        LoggingService.log("Terminal was closed/killed");
        this.activeExecution = false;
        this.resetTerminal = true;
    });

    context.subscriptions.push(changeDisposable, endDisposable, closeDisposable);
  }

  private isTerminalRunning(): boolean {
    if (!this.terminal) return false;
    return !this.terminal.exitStatus;
  }

  private async killTerminal() {
    this.activeExecution = false;
    this.resetTerminal = true;
    await this.terminal?.dispose();
  }

  private async executeCommand() {
    if (!this.terminal!.shellIntegration) {
      LoggingService.log("Shell Integration is not ready or not enabled...");
      return;
    }
    //TODO: error handling?
    //TODO: what if shell integration is not enabled?
    LoggingService.log(`Executing Command In Terminal ${this.terminalExecutionConfig.command}`);
    this.activeExecution = true;
    const shellExecution = this.terminal!.shellIntegration!.executeCommand(this.terminalExecutionConfig.command);
    const stream = shellExecution.read();
    for await (const data of stream) {
      this.terminalExecutionConfig.onOutput(data);
    }
  }
}
