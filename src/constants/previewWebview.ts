export function getWebViewContents(serverURL: string) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>myServer</title>
    <style>
        body { margin: 0; padding: 0; }
        iframe {
            width: 100%;
            // height: calc(100vh - 50px); /* Leave space for the toolbar */
            border: 2px solid red;
        }
    </style>
</head>
<body>
    <div class="toolbar"></div>
    <iframe src="${serverURL}" sandbox="allow-same-origin allow-scripts"></iframe>
</body>
</html>
`;
}
