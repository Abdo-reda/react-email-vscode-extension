"use strict";
console.log("---- I am working :)");
setInterval(() => console.log('--- 1'), 1000);
const vscode = acquireVsCodeApi();
const mainDiv = document.getElementById("main");
function replaceMainContent(html) {
    mainDiv.innerHTML = html;
}
replaceMainContent("----- replaced :)");
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
