import * as vscode from "vscode";
import {
  doesAngularProjectHaveCollectionReference,
  isAngularProject,
} from "./angular-project.functions";
import { doesPackageJsonHavePackageInstalled } from "./package-json.functions";

export async function initExtension(extensionName: string) {
  const loggingChannel = vscode.window.createOutputChannel(extensionName);

  if (
    !(await doesPackageJsonHavePackageInstalled(extensionName, loggingChannel))
  ) {
    return false;
  }

  if (!(await isAngularProject(loggingChannel))) {
    return false;
  }

  if (
    !(await doesAngularProjectHaveCollectionReference(
      extensionName,
      loggingChannel
    ))
  ) {
    return false;
  }

  vscode.commands.executeCommand(
    "setContext",
    "opinionatedSchematicsActive",
    true
  );

  loggingChannel.appendLine(`Extension "${extensionName}" is now active`);

  return true;
}
