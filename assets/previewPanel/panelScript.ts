console.log("---- I am working");

interface vscode {
  postMessage(message: any): void;
}
declare function acquireVsCodeApi(): vscode;

const vscode = acquireVsCodeApi();
const mainDiv = document.getElementById("main")!;

function replaceMainContent(html: string) {
  mainDiv.innerHTML = html;
}

replaceMainContent("----- replaced :)")

function listenToVscodeMessages() {
  window.addEventListener("message", (event) => {
    const message = event.data; // The JSON data our extension sent
	console.log('--- recieved message');
    // switch (message.command) {
    //   case "refactor":
    //     count = Math.ceil(count * 0.5);
    //     counter.textContent = count;
    //     break;
    // }
  });
}
