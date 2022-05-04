// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const axios = require('axios');
// const { takeCoverage } = require('v8');
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
const POSTMAN_WEBHOOK_URL = "https://newman-api.getpostman.com/run/20561716/ba26d0b3-495c-44db-8c97-b8ce20758c82"

function create_UUID() {
	let dt = new Date().getTime();
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		const r = (dt + Math.random() * 16) % 16 | 0;
		dt = Math.floor(dt / 16);
		return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
	});
}



function isValidHttpUrlV3(str) {
	var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
	  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
	  '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
	  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
	  '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
	  '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
	return !!pattern.test(str);
  }


function requestURL(editor) {
	const document = editor.document;
	// TODO add support for multiple selections
	// editor.selections
	const selection = editor.selection;
	const word = document.getText(selection);
	console.log("requestURL invoked");
	if (!isValidHttpUrlV3(word)) {
		vscode.window.showErrorMessage("Selection is not a valid URL");
		return;
	}

	let request = `${POSTMAN_WEBHOOK_URL}`;

	console.log(request);

	const taskUUID = create_UUID();

	axios.post(request, {
		taskId: taskUUID,
		testUrl: word,

	  })
	  .then(function (response) {
		console.log(response);
		// console.log("Report will be available at ", "https://l46zb6.deta.dev/" + "?taskId=" + taskUUID);
		// let reportLink =  "https://l46zb6.deta.dev/report?id=" + taskUUID;
		// let here = "Show my report";
		// // vscode.window.showInformationMessage("Your report is being generated and will be available at " + reportLink);
		// vscode.window.showInformationMessage("Your report is being generated!", here).then(selection => {
		// 	if (selection === here) {
		// 	  vscode.env.openExternal(vscode.Uri.parse(
		// 		reportLink));
		// 	}
		// });
		vscode.window.showInformationMessage("👋 Please wait while we're generating your report...")
		// setTimeout( vscode.env.openExternal(reportLink), 5000);
	  })
	  .catch(function (error) {
		console.log(error);
	});
	let pollingRetries = 0;
	pollingReportApi("https://echo.deta.dev/report/json?id=" + taskUUID, 2000, pollingRetries, taskUUID);

	// let jsonReportLink =  "https://l46zb6.deta.dev/report/json?id=" + taskUUID; 
	// will return 404 when not found, 200 when found, poll till
	
}


function pollingReportApi(getRequestUrl, pollingInterval, pollingRetries, taskUUID) {
	let reportLink =  "https://echo.deta.dev/report?id=" + taskUUID;
	let here = "✨ Show my report ✨";
	console.log(pollingInterval, pollingRetries);
	axios.get(getRequestUrl)
	  .then(function (response) {
		console.log("Got response for polling");
		console.log(response);
		vscode.window.showInformationMessage("🚪 CORS Status : " + response.data.cors);
		vscode.window.showInformationMessage("⏲️ Average Response Time : " + response.data.averageResponseTime + 'ms');
		// vscode.window.showInformationMessage("Your report is being generated and will be available at " + reportLink);
		vscode.window.showInformationMessage("📝 Click the button below to find your report!", here).then(selection => {
			if (selection === here) {
			  vscode.env.openExternal(vscode.Uri.parse(
				reportLink));
			}
		});
	  })
	  .catch(function (error) {
		  console.log(error);
		  if (pollingRetries < 10){
			pollingRetries ++;
			setTimeout(pollingReportApi, pollingInterval, getRequestUrl, pollingInterval, pollingRetries, taskUUID);
		  } else {
			let buttonText = "Show me the results anyway! 👐";
			vscode.window.showInformationMessage("Oops! Looks like it's taking longer than expected!", buttonText).then(selection => {
				if (selection === buttonText) {
				  vscode.env.openExternal(vscode.Uri.parse(
					reportLink));
				}
			});
		  }
			
	});
	
}

function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "ezy-site-tester" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	// let disposable = vscode.commands.registerCommand('ezy-site-tester.helloWorld', function () {
	// 	// The code you place here will be executed every time your command is executed
		
	// 	// Display a message box to the user
	// 	vscode.window.showInformationMessage('Hello World from Ezy Site Tester!');
	// });
	let regular = vscode.commands.registerCommand('ezy-site-tester.regular', () => {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			requestURL(editor)
		}
	});
	context.subscriptions.push(regular);
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
