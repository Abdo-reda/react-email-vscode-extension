import * as vscode from "vscode";
import { PreviewPanelStateEnum } from "../constants/previewPanelStateEnum";
import {
  getErrorWebviewContent,
  getLoadingWebviewContent,
  getNoneWebviewContent,
} from "../constants/previewWebviewConstant";
import { IPanelState } from "../interfaces/panelStateInterface";
import { IRenderEmail } from "../interfaces/renderEmailOutput";

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

  static setEmailTitle(title: string): void {
    this.panelStateInfo.emailTitle = title;
  }

  static setPreviewState(emailOutput: IRenderEmail): void {
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
    this.previewPanel.webview.html = this.getHtmlContent();
  }

  private static createPanel(): vscode.WebviewPanel {
    const panel = vscode.window.createWebviewPanel(
      "react-email.server",
      "React Email Preview",
      {
        viewColumn: vscode.ViewColumn.Beside,
        preserveFocus: true,
      },
      {
        enableScripts: false,
        localResourceRoots: [],
      }
    );
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

    return panel;
  }

  private static getHtmlContent(): string {
    switch (this.panelState) {
      case PreviewPanelStateEnum.NONE:
        return getNoneWebviewContent();
      case PreviewPanelStateEnum.LOADING:
        return getLoadingWebviewContent();
      case PreviewPanelStateEnum.ERROR:
        return getErrorWebviewContent(this.panelStateInfo.emailErrors);
      case PreviewPanelStateEnum.PREVIEW:
        return this.panelStateInfo.emailOutput.html; //TODO: more here probably?
      default:
        return getNoneWebviewContent();
    }
  }

  private static getTitle(): string {
    if (this.panelStateInfo.emailTitle)
      return `${this.panelStateInfo.emailTitle}[preview]`;
    return "React Email Preview";
  }
}
