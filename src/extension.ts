import * as vscode from 'vscode';
import { ExtensionService } from "./services/extensionService";

//NOW:
	//- fix general flow issues. There are mainly three things.
		//- file changes/saves.
		//- running rendering script
		//- panel updating.
		//*** panel opening is seperate and independent. So, we might make like an event system, or a panel singlton class.
			//the panel service will hold the most recent and updated renderEmailOutput.
	//- whenever I safe the file or change the file, the script needs to rerun, the panel content needs to get updated.

//---- Tab feature:
	//- the tab title is filename[preview]
	//- the tab icon is react email maybe
	//- the tab has a toolbar:
		//- color picker options to change the background.
		//- a simple gmail preview option
		//- a text option.
		//- size/zoom (100% so on ..)
		//- source code viewer
		//- source code inspector
		//- the tab has a loading indicator somewhere (maybe on its bar on the top right)
	//- the tab shows a preview/render of the output of the render method or localhost url

//TODO:
	//--- Make sure that the server runs after installation is complete ... I think ...
	//--- Fix the order of the configuration
	//--- we can't disable things for now, so we will have to manually show warnings and update the setting for the user.
	//--- make the status bar service a signleton maybe ... 
	//--- Warnings from npm??

//--- functionality
	//- status bar 
		// (green, server is live, hover, tells you the server is live at what (url). --> opens the tab in case it was closed and shows the terminal.
		// (red, server was unable to run) --> clicks, opens terminal/logs
		// (grey, nothing is happening) --> runs the server and opens the tab
	//- add support for deno depenednecies

//--- So, settings for:
	//- local dependencies (project) or external dependencies (temp-project)
	//- directory for temp project (default is storageUri for extension)
	//- in case local, the version settings should be disabled.
		//- 4 version settings, for each package. (react, react-dom, react-mail-components, react-mail)
	//- live server or automatic render
	//- terminal.
		//- color.
		//- showbydefualt (boolean)

//--- Enhacnements.
	//- MORE THAN ONE EMAIL AT THE SAME TIME.
		//- support different emails at the same time. (will have to perform cleanup when the extension starts or disposes to delete any files in the emails folder if there is any)
		//- support multiple project with different dependencies (external projects) ... somehow.

const extensionService = new ExtensionService();

export async function activate(context: vscode.ExtensionContext) {
	extensionService.activate(context);
}

export function deactivate() {
	extensionService.deactivate();
}
