import * as fs from "fs";
import * as vscode from "vscode";

export async function isAngularProject(loggingChannel: vscode.OutputChannel) {
  const angularJson = await vscode.workspace.findFiles("angular.json");

  if (angularJson.length === 0) {
    loggingChannel.appendLine("No angular.json found, trying workspace.json");

    const workspaceJson = await vscode.workspace.findFiles("workspace.json");

    if (workspaceJson.length === 0) {
      loggingChannel.appendLine(
        "No angular.json or workspace.json found, not registering command"
      );

      return false;
    }
  }

  return true;
}

export async function doesAngularProjectHaveCollectionReference(
  packageName: string,
  loggingChannel: vscode.OutputChannel
) {
  const angularJsonContents = await getAngularJsonContents();

  const defaultCollection = angularJsonContents?.cli?.defaultCollection;

  if (!defaultCollection) {
    loggingChannel.appendLine(
      `No cli.defaultCollection property in angular.json found, please add '"cli": {"defaultCollection": "${packageName}"}' or '"cli": {"defaultCollection": "./collection.json"}' with the file content of: '{"extends": ["${packageName}"], "schematics": {}}'. Using a collection.json is useful if you want to extend from multiple different schematics packages.`
    );
    return false;
  }

  if (defaultCollection.includes(".json")) {
    const collectionJson = await vscode.workspace.findFiles(
      defaultCollection.replace("./", "")
    );

    if (collectionJson.length === 0) {
      loggingChannel.appendLine(
        `No ${defaultCollection} found, please add a file with the contents of: '{"extends": ["${packageName}"], "schematics": {}}'`
      );
      return false;
    }

    const collectionJsonContents = JSON.parse(
      fs.readFileSync(collectionJson[0].fsPath).toString()
    );

    if (
      !(collectionJsonContents?.extends as string[])?.find(
        (str) => str === packageName
      )
    ) {
      loggingChannel.appendLine(
        `${defaultCollection} does not contain ${packageName} in the 'extends' property, please add ${packageName} to the extends property: "extends": ["${packageName}"]`
      );
      return false;
    }
  } else if (defaultCollection !== packageName) {
    loggingChannel.appendLine(
      `angular.json does not contain ${packageName} in the cli.defaultProject property, please add 'cli: {defaultProject: "${packageName}"}'`
    );
    return false;
  }

  return true;
}

async function getAngularJsonContents() {
  const angularJson = await vscode.workspace.findFiles("angular.json");

  if (angularJson.length === 0) {
    const workspaceJson = await vscode.workspace.findFiles("workspace.json");

    return JSON.parse(fs.readFileSync(workspaceJson[0].fsPath).toString());
  }

  return JSON.parse(fs.readFileSync(angularJson[0].fsPath).toString());
}
