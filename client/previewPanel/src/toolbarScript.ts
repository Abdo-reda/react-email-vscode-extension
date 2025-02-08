interface vscode {
  postMessage(message: any): void;
}
declare function acquireVsCodeApi(): vscode;

const vscode = acquireVsCodeApi();
let currentZoom = 1;

export function buildToolbar(toolbar: HTMLElement) {
  toolbar.append(createToolbarButton("Inspect", handleInspect, 'inspect'));
  toolbar.append(createToolbarButton("Zoom Out", handleZoomOut, 'zoom-out'));
  toolbar.append(createToolbarButton("Zoom In", handleZoomIn, 'zoom-in'));
  // toolbar.append(createToolbarButton("Show Text", handleText, '', 'preview'));
  // toolbar.append(createToolbarButton("Show Text", handleText, '', 'text'));
  // toolbar.append(createToolbarButton("Show Source", handleHtml, '', '<html />'));
}

function createToolbarButton(actionTitle: string, handler: (e: MouseEvent) => void, icon?: string, text?: string) {
  const btn = document.createElement("button");
  btn.title = actionTitle;
  btn.type = "button";
  btn.classList.add("toolbar-button");
  btn.onclick = handler;

  if (icon) {
    btn.innerHTML = `<i class="codicon codicon-${icon}"></i>`;
  }

  if (text) {
    btn.textContent = text;
  }

  return btn;
}

function handleZoomIn() {
  const iframeRef = document.getElementById("frame");
  if (!iframeRef) return;
  currentZoom += 0.5;
  if (currentZoom > 3) currentZoom = 1;
  iframeRef.style.scale = `${currentZoom}`;
}

function handleZoomOut() {
  const iframeRef = document.getElementById("frame");
  if (!iframeRef) return;
  currentZoom -= 0.5;
  if (currentZoom < 1) currentZoom = 1;
  iframeRef.style.scale = `${currentZoom}`;
}

function handleInspect() {
  vscode.postMessage({command: 'inspect'});
}

function handleText() {
  vscode.postMessage({command: 'text'});
}

function handleHtml() {
  vscode.postMessage({command: 'html'});
}