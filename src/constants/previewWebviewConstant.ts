export function getLoadingWebviewContent() {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            margin: 0;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }
        .loader {
            width: 50px;
            height: 50px;
            margin: 20px;
            animation: spin 2s linear infinite;
        }
        @keyframes spin {
            0% {
                transform: rotate(0deg);
            }
            100% {
                transform: rotate(360deg);
            }
        }
        .message {
            font-size: 18px;
        }
    </style>
</head>
<body>
    <svg class="loader" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" stroke="#555" stroke-width="10" fill="none" stroke-dasharray="250" stroke-dashoffset="48">
        </circle>
    </svg>
    <div class="message">Setting up stuff...</div>
</body>
</html>
`;
}

export function getNoneWebviewContent() {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
          body { margin: auto; padding: 0; }
      </style>
  </head>
  <body>
      <h1> NONE </h1>
  </body>
  </html>
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
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { margin: auto; padding: 0; }
        </style>
    </head>
    <body>
       <iframe src="http://localhost:${port}" style="border: none; width: 100%; height: 100vh;" sandbox="allow-scripts allow-same-origin"></iframe>
    </body>
    </html>
    `;
}
