import * as vscode from "vscode";
import { PreviewPanelStateEnum } from "../constants/previewPanelStateEnum";
import {
  getErrorWebviewContent,
  getLoadingWebviewContent,
  getNoneWebviewContent,
  getRenderingWebviewContent,
  getTemplateWebviewContent,
} from "../constants/previewWebviewConstant";
import { IPanelState } from "../interfaces/panelStateInterface";
import { IRenderEmail } from "../interfaces/renderEmailOutput";
import crypto from "node:crypto";
import { PreviewPanelCommandEnum } from "../constants/previewPanelCommandEnum";
import { IPanelHtmlMessage } from "../interfaces/panelMessageInterface";

export class PreviewPanelService {
  private static previewPanel: undefined | vscode.WebviewPanel;
  private static context: vscode.ExtensionContext;
  private static panelState: PreviewPanelStateEnum = PreviewPanelStateEnum.NONE;
  private static panelStateInfo: IPanelState;

  static init(context: vscode.ExtensionContext) {
    this.context = context;
    this.setNoneState();
  }

  static showOrCreatePanel(): void {
    if (!this.previewPanel) {
      this.previewPanel = this.createPanel();
    } else {
      this.previewPanel.reveal(vscode.ViewColumn.Beside, true);
    }
    this.refreshPanel();
  }

  static isDisposed(): boolean {
    return !this.previewPanel;
  }

  static setEmailTitle(title: string): void {
    this.panelStateInfo.emailTitle = title;
  }

  static setRenderingState(title: string): void {
    this.panelState = PreviewPanelStateEnum.RENDERING;
    this.setEmailTitle(title);
    this.refreshPanel();
  }

  static setPreviewState(emailOutput: IRenderEmail): void {
    if (this.panelStateInfo.emailOutput.html === emailOutput.html && this.panelState === PreviewPanelStateEnum.PREVIEW) {
      return;
    }
    this.panelState = PreviewPanelStateEnum.PREVIEW;
    this.panelStateInfo.emailOutput = emailOutput;
    this.refreshPanel();
  }

  static setLoadingState(): void {
    this.panelState = PreviewPanelStateEnum.LOADING;
    this.refreshPanel();
  }

  static setErrorState(errors: string): void {
    this.panelState = PreviewPanelStateEnum.ERROR;
    this.panelStateInfo.emailErrors = errors;
    this.refreshPanel();
  }

  static setNoneState(): void {
    this.panelState = PreviewPanelStateEnum.NONE;
    this.panelStateInfo = {
      emailErrors: "",
      emailOutput: {
        html: "",
        text: "",
      },
      emailTitle: "",
    };
    this.refreshPanel();
  }

  private static refreshPanel(): void {
    if (!this.previewPanel) return;
    this.previewPanel.title = this.getTitle();
    this.setMainContent(this.getHtmlContent());
  }

  private static createPanel(): vscode.WebviewPanel {
    const panel = vscode.window.createWebviewPanel(
      "react-email-renderer.server",
      "React Email Preview",
      {
        viewColumn: vscode.ViewColumn.Beside,
        preserveFocus: true,
      },
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.joinPath(this.context.extensionUri, 'assets/previewPanel')]
      },
    );

    // panel.iconPath = vscode.Uri.file(context.asAbsolutePath('resources/loading.png'));
    
    // panel.webview.onDidReceiveMessage(
    //   (message) => {
    //     console.log("--- recieved message");
    //   },
    //   undefined,
    //   context.subscriptions
    // );

    panel.onDidDispose(
      () => {
        this.previewPanel = undefined;
        this.setNoneState();
      },
      undefined,
      this.context.subscriptions
    );

    this.setContainerHtmlContent(panel);

    return panel;
  }

  private static setContainerHtmlContent(panel: vscode.WebviewPanel) {
    const scriptUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'assets', 'previewPanel', 'panelScript.js'));
    const styleUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'assets', 'previewPanel', 'panelStyle.css'));
    panel.webview.html = getTemplateWebviewContent(panel.webview.cspSource, this.getNonce(), styleUri, scriptUri);
  }

  private static getHtmlContent(): string {
    switch (this.panelState) {
      case PreviewPanelStateEnum.NONE:
        return getNoneWebviewContent();
      case PreviewPanelStateEnum.LOADING:
        return getLoadingWebviewContent();
      case PreviewPanelStateEnum.ERROR:
        return getErrorWebviewContent(this.panelStateInfo.emailErrors);
      case PreviewPanelStateEnum.RENDERING:
        return getRenderingWebviewContent(); //TODO: fix previews
      case PreviewPanelStateEnum.PREVIEW:
        return this.panelStateInfo.emailOutput.html; //TODO: more here probably?
      default:
        return getNoneWebviewContent();
    }
  }

  private static getTitle(): string {
    if (this.panelStateInfo.emailTitle)
      return `${this.panelStateInfo.emailTitle}[preview]`;
    return "React Email [preview]";
  }

  
  private static setMainContent(htmlContent: string): void {
    const message: IPanelHtmlMessage = {
      command: PreviewPanelCommandEnum.SET_MAIN_CONTENT,
      data: {
        html: htmlContent,
      }
    };
    this.previewPanel!.webview.postMessage(message);
  }

  private static getNonce(): string {
    return crypto.randomBytes(8).toString('base64');
  }
}
