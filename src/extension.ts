// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { EXTENSION_NAME } from "./constants/extension-name.constant";
import { initExtension } from "./functions/init";
import { registerSchematics } from "./functions/register-schematics.functions";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  const initialisationOutput = await initExtension(EXTENSION_NAME);

  if (initialisationOutput) {
    await registerSchematics(context, initialisationOutput);
  }
}

// this method is called when your extension is deactivated
export function deactivate() {}
