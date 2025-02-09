import * as vscode from "vscode";

export function getTemplateWebviewContent(cpcSource: string, nonce: string, codiconsUri: vscode.Uri, styleUri: vscode.Uri, scriptUri: vscode.Uri) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" 
      content="default-src 'none'; 
      style-src ${cpcSource}; 
      img-src ${cpcSource} https:; 
      font-src ${cpcSource};
      script-src 'nonce-${nonce}';
      frame-src http://localhost:* https://localhost:*;"
    >
    <link href="${styleUri}" rel="stylesheet">
    <link href="${codiconsUri}" rel="stylesheet" />
</head>
<body>
  <div id="toolbar"> </div>
  <div id="main">
  </div>
  <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>
`;
}

export function getLoadingWebviewContent() {
  return `
  <div class="loader-container">
    <svg class="loader" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" stroke="#555" stroke-width="10" fill="none" stroke-dasharray="250" stroke-dashoffset="48">
        </circle>
    </svg>
    <h2>Setting up stuff...</h2>
  </div>
`;
}

export function getNoneWebviewContent() {
  return `
    <h2> ----- NO EMAIL ----- </h2>
  `;
}

export function getErrorWebviewContent(error: string) {
  return `
  <div class="error-container">
    <div class="error-box">
      <h1 class="error-heading">Something Went Wrong!</h1>
      <p class="error-msg">${error}</p>
    </div>
  </div>
  `;
}

export function getServerWebviewContent(port: number) {
  return `
  <iframe id="frame" src="http://localhost:${port}"></iframe>
`;
}

export function getScriptWebviewContent(html: string) {
  return `
  <iframe id="frame" srcdoc="${html}" ></iframe>
`;
}

export function getRenderingWebviewContent() {
  return `
    <div class="loader-container">
    <svg class="loader" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" stroke="#555" stroke-width="10" fill="none" stroke-dasharray="250" stroke-dashoffset="48">
        </circle>
    </svg>
    <h2>Rendering ...</h2>
  </div>
  `;
}
