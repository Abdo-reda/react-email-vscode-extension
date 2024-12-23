import * as vscode from "vscode";
import { exec, execSync } from "child_process";
import { ExtensionConfigurations } from "../constants/configurationEnum";
import { LoggingService } from "../services/loggingService";

const config = vscode.workspace.getConfiguration("react-mail");

export function getConfiguration<T>(
  configuration: ExtensionConfigurations
): T | undefined {
  return config.get<T>(configuration);
}

export function showProgressMessageV2(title: string, cancellable: boolean = true, timeInSec = 10) {
  vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: title,
      cancellable: cancellable,
    },
    async (progress, token) => {
      for (let i = 0; i < 10; i++) {
        setTimeout(() => progress.report({ increment: i * 10 }), 3 * 1000);
      }
    }
  );
}

export function showProgressMessage(
  message: string,
  duration: number = 1000,
  cancellable: boolean = true
) {
  vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: message,
      cancellable: cancellable,
    },
    async (progress, token) => {
      const steps = 100;
      const delay = duration / steps;

      for (let i = 0; i <= steps; i++) {
        await new Promise<void>((resolve) => {
          setTimeout(() => {
            progress.report({ increment: 1 });
            resolve();
          }, delay);
        });
      }
    }
  );
}

export async function fileExistsAsync(uri: vscode.Uri): Promise<boolean> {
  LoggingService.log(`Checking if file exists at ${uri.fsPath}`);
  try {
    await vscode.workspace.fs.stat(uri);
    return true;
  } catch {
    return false;
  }
}

export function runCommandInBackground(
  command: string,
  errorCallback: (output: string) => void = () => {},
  successCallback: (output: string) => void = () => {},
  workingDirectory: string | undefined = undefined,
) {
  LoggingService.log(`Running command '${command}'`);
  exec(command, { cwd: workingDirectory }, (error, stdout, stderr) => {
    if (error) {
      errorCallback(stdout);
      return;
    }
    if (stderr) {
      vscode.window.showWarningMessage(`Warning: ${stderr}`);
      return;
    }
    successCallback(stdout);
  });
}

export function runCommandSync(
  command: string,
  workingDirectory: string | undefined = undefined
): string {
  LoggingService.log(`Running command '${command}'`);
  try {
    const output = execSync(command, { cwd: workingDirectory, encoding: "utf-8" });
    return output;
  } catch (error) {
    if (error instanceof Error && "stdout" in error) {
      const output = error.stdout as string;
      throw new Error(output);
    }
    throw error;
  }
}

export function getActiveDirectory(): string | undefined {
  const workspaceFolders = vscode.workspace.workspaceFolders;

  if (workspaceFolders && workspaceFolders.length > 0) {
    return workspaceFolders[0].uri.fsPath;
  }

  const activeEditor = vscode.window.activeTextEditor;
  if (activeEditor) {
    return vscode.Uri.joinPath(activeEditor.document.uri, "..").fsPath;
  }

  return undefined;
}

export function getActiveDocument(): vscode.TextDocument|undefined {

  const activeEditor = vscode.window.activeTextEditor;
  return activeEditor?.document;
}

export function showInfoMessage(msg: string): void {
  vscode.window.showInformationMessage(`${msg}!`);
}

export function showWarningMessage(msg: string): void {
  vscode.window.showWarningMessage(`${msg}!`);
}

export function showErrorMessage(msg: string): void {
  vscode.window.showErrorMessage(`${msg}!`);
}