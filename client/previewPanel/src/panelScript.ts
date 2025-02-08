import { buildToolbar } from "./toolbarScript.js";

const mainDiv = document.getElementById("main")!;
const toolbarDiv = document.getElementById("toolbar")!;

function listenToVscodeMessages() {
  window.addEventListener("message", (event) => {
    const message = event.data;
    handleMessage(message.command, message.data);
  });
}

function handleMessage(command: string, data: any) {
  if (command === "setMainContent") {
    replaceMainContent(data.html);
  }
}

function replaceMainContent(html: string) {
  //maybe if its the same html content, we shouldn't do anything?
  mainDiv.innerHTML = html;
}

buildToolbar(toolbarDiv);
listenToVscodeMessages();
