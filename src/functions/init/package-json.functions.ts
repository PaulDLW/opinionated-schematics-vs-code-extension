import * as fs from "fs";
import * as vscode from "vscode";

export async function doesPackageJsonHavePackageInstalled(
  packageName: string,
  loggingChannel: vscode.OutputChannel
) {
  const packageJson = await vscode.workspace.findFiles("package.json");

  if (packageJson.length === 0) {
    loggingChannel.appendLine("No package.json found, not registering command");
    return false;
  }

  const packageJsonContents = fs.readFileSync(packageJson[0].fsPath).toString();

  if (!packageJsonContents.includes(packageName)) {
    return false;
  }

  return true;
}
