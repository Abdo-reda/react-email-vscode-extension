import * as vscode from "vscode";
import { ChildProcess, exec, execSync, spawn } from "child_process";
import { ExtensionConfigurations } from "../constants/configurationEnum";
import { LoggingService } from "../services/loggingService";

const config = vscode.workspace.getConfiguration("react-email");

export function getConfiguration<T>(
  configuration: ExtensionConfigurations
): T | undefined {
  return config.get<T>(configuration);
}

export async function updateConfiguration(
  configuration: ExtensionConfigurations,
  value: any,
  configurationTarget: vscode.ConfigurationTarget
) {
  await config.update(configuration, value, configurationTarget);
}

export function isConfigurationChanged(
  event: vscode.ConfigurationChangeEvent,
  configuration: ExtensionConfigurations,
): boolean {
  return event.affectsConfiguration(`react-email.${configuration}`);
}

export function showProgressMessageV2(title: string, cancellable: boolean = true, timeInSec = 10) {
  vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: title,
      cancellable: cancellable,
    },
    async (progress, _) => {
      for (let i = 0; i < timeInSec; i++) {
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
    async (progress, _) => {
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

export function spawnProcess(
  command: string, 
  args: string[] = [], 
  workingDirectory: string | undefined = undefined, 
  errorCallback: (err: Error) => void = () => {},
): ChildProcess {
  LoggingService.log(`Spawning a process with the command '${command}'`);
  const process = spawn(command, args, {
    stdio: 'inherit', 
    shell: true,    
    cwd: workingDirectory 
  });

  process.on('error', (err) => {
    console.log('--- child process error', err);
    errorCallback(err);
  });

  process.on('close', (code) => {
    console.log('--- child process close', code);
  });

  process.on('disconnect', () => {
    console.log('--- child process disconnected');
  });

  return process;
}

export function runCommandInBackground(
  command: string,
  workingDirectory: string | undefined = undefined,
  errorCallback: (output: string) => void = () => {},
  successCallback: (output: string) => void = () => {},
) {
  LoggingService.log(`Running command '${command}' at path ${workingDirectory ?? 'default'}`);
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
  LoggingService.log(`Running command '${command}' at path ${workingDirectory ?? 'default'}`);
  try {
    const output = execSync(command, { cwd: workingDirectory, encoding: "utf-8" });
    return output;
  } catch (error: any) {
    if ("stdout" in error && error.stdout) {
      throw new Error(error.stdout); //TODO: maybe make a custom error object.
    } else if ("stderr" in error) {
      throw new Error(error.stderr);
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