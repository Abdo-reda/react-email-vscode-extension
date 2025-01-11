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

  init(context: vscode.ExtensionContext, visibility: boolean, icon: vscode.ThemeIcon, color: vscode.ThemeColor) {
    this.resetTerminal = true;
    this.visibility = visibility;
    this.icon = icon;
    this.color = color;
    this.setupListeners(context);
  }

  async runTerminal(command: string, cwd: vscode.Uri, onOutput: (output: string) => void = () => {}) {
    const oldCWD = this.terminalExecutionConfig.cwd?.fsPath;
    const oldCommand = this.terminalExecutionConfig.command;
    this.terminalExecutionConfig = {
      cwd: cwd,
      command: command,
      onOutput: onOutput,
    };
    if (this.resetTerminal || oldCWD !== cwd.fsPath) {
      await this.createTerminal(cwd);
      return;
    }
    if (oldCommand !== command || !this.activeExecution) {
      this.executeCommand(); //TODO: should I use await?
    }
  }

  async restartTerminal() {
    if (!this.terminalExecutionConfig.cwd) return;
    LoggingService.log("Restarting Terminal");
    await this.createTerminal(this.terminalExecutionConfig.cwd);
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
    this.resetTerminal = false;
    await this.killTerminal();
    this.terminal = vscode.window.createTerminal({
      cwd: cwd,
      name: name,
      hideFromUser: this.visibility,
      color: this.color,
      iconPath: this.icon,
    });
    this.terminal.show(true); //TODO: remove later

    // this.terminal.sendText(command, true); //TODO: what if shell integration is not enabled? is this the right way of handling this? should I just return to sendingText and using node child process ... I hate everything >.<
  }

  private setupListeners(context: vscode.ExtensionContext) {
    const changeDisposable = vscode.window.onDidChangeTerminalShellIntegration(async (event) => {
      LoggingService.log(`Shell Integration Enabled for terminal '${event.terminal.name}'`);
      if (event.terminal !== this.terminal || this.activeExecution) return;
      this.executeCommand();
    });

    const endDisposable = vscode.window.onDidEndTerminalShellExecution((event) => {
      console.log('--- terminal execution ended');
      if (event.terminal !== this.terminal) return;
      this.activeExecution = false;
    });

    context.subscriptions.push(changeDisposable, endDisposable);
  }

  private isTerminalRunning(): boolean {
    if (!this.terminal) return false;
    return !this.terminal.exitStatus;
  }

  private async killTerminal() {
    this.activeExecution = false;
    await this.terminal?.dispose();
  }

  private async executeCommand() {
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
