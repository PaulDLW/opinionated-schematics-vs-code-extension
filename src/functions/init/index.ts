import * as path from "path";
import * as vscode from "vscode";
import { InitialisationOutput } from "../../models/initialisation-output.model";
import { getRoot } from "../util/get-root.function";
import {
  doesAngularProjectHaveCollectionReference,
  isAngularProject,
  isPackageInstalledGlobally,
} from "./angular-project.functions";
import { doesPackageJsonHavePackageInstalled } from "./package-json.functions";

export async function initExtension(extensionName: string) {
  const loggingChannel = vscode.window.createOutputChannel(extensionName);

  if (!(await isAngularProject(loggingChannel))) {
    return null;
  }

  let useGlobalExtension = false;

  if (
    !(await doesPackageJsonHavePackageInstalled(
      extensionName,
      loggingChannel
    )) ||
    !(await doesAngularProjectHaveCollectionReference(
      extensionName,
      loggingChannel
    ))
  ) {
    if (!isPackageInstalledGlobally(extensionName, loggingChannel)) {
      return null;
    } else {
      useGlobalExtension = true;
    }
  }

  const nodeModulesPath = getNodeModulesPath(useGlobalExtension);

  if (!nodeModulesPath) {
    loggingChannel.appendLine(`Cannot find global node_modules path`);
    return null;
  }

  vscode.commands.executeCommand(
    "setContext",
    "opinionatedSchematicsActive",
    true
  );

  loggingChannel.appendLine(`Extension "${extensionName}" is now active`);

  return {
    commandPrefix: useGlobalExtension ? "os" : "ng g",
    nodeModulesPath: nodeModulesPath,
  } as InitialisationOutput;
}

function getNodeModulesPath(useGlobalExtension: boolean) {
  if (useGlobalExtension) {
    const npmPath = process.env.Path?.split(";").find((path) =>
      path.includes("npm")
    );

    if (!npmPath) {
      return null;
    }

    return npmPath + path.sep + "node_modules";
  } else {
    const root = getRoot();

    return root + path.sep + "node_modules";
  }
}
