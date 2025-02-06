interface vscode {
  postMessage(message: any): void;
}
declare function acquireVsCodeApi(): vscode;

let currentZoom = 1;
const vscode = acquireVsCodeApi();
const mainDiv = document.getElementById("main")!;
const toolbarDiv = document.getElementById("toolbar")!;

function replaceMainContent(html: string) {
  mainDiv.innerHTML = html;
}

function replaceToolbarContent(html: string) {
  toolbarDiv.innerHTML = html;
}

function handleCommand(command: string) {
  if (command === "zoom") {
    zoomFunc();
  }
}

function zoomFunc() {
  const iframeRef = document.getElementById("frame");
  if (!iframeRef) return;
  currentZoom += 0.5;
  if (currentZoom > 3) currentZoom = 1;
  iframeRef.style.scale = `${currentZoom}`;
}

function listenToVscodeMessages() {
  window.addEventListener("message", (event) => {
    const message = event.data;
    if (message.command === "setMainContent") {
      replaceMainContent(message.data.html);
    } else if (message.command === "setToolbarContent") {
      replaceToolbarContent(message.data.html);
    }
  });
}

listenToVscodeMessages();
