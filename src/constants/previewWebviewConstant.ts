import * as vscode from "vscode";

//TODO: make sure to take into consideration https://code.visualstudio.com/api/extension-guides/webview#theming-webview-content

// <meta
// http-equiv="Content-Security-Policy"
// content="default-src 'none'; iframe-src ${webview.cspSource} http:;"
// />

export function getTemplateWebviewContent(cpcSource: string, nonce: string, styleUri: vscode.Uri, scriptUri: vscode.Uri) {
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
      script-src 'nonce-${nonce}';
      frame-src http://localhost:* https://localhost:*;"
    >
    <link href="${styleUri}" rel="stylesheet">
</head>
<body>
  <div id="toolbar">
  </div>
  <div id="main">
    <h1> this is a template </h1>
  </div>
  <script nonce="${nonce}" src="${scriptUri}"></script>
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
    <h1> NONE </h1>
  `;
}

export function getErrorWebviewContent(error: string) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }

    .error-container {
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 1rem;
    }

    .error-box {
      border: 1px solid red;
      border-radius: 8px;
      background-color: #ffecec;
      color: #b00020;
      padding: 1rem;
      word-wrap: break-word;
    }

    .error-heading {
      font-size: 1.5rem;
      margin: 0 0 1rem;
      color: #b00020;
    }

    .error-msg {
      font-size: 1rem;
      margin: 0;
    }
  </style>
</head>
<body>
  <div class="error-container">
    <div class="error-box">
      <h1 class="error-heading">Something Went Wrong!</h1>
      <p class="error-msg">${error}</p>
    </div>
  </div>
</body>
</html>
  `;
}

export function getServerWebviewContent(port: number) {
  return `
  <iframe src="http://localhost:${port}" style="border: none; width: 100%; height: 100vh;" sandbox="allow-scripts allow-same-origin"></iframe>
`;
}

export function getRenderingWebviewContent() {
  return `
    <h1> RENDERING </h1>
  `;
}
