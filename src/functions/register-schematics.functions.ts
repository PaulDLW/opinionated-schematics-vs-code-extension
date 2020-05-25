import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { InitialisationOutput } from "../models/initialisation-output.model";
import { Argument, Schematic } from "../models/schematic.model";
import { getRoot } from "./util/get-root.function";

export async function registerSchematics(
  context: vscode.ExtensionContext,
  initialisationOutput: InitialisationOutput,
  extensionName: string
) {
  const schematics = getSchematics(initialisationOutput, extensionName);

  const componentSchematic = schematics.find(
    (schematic) => schematic.name === "component"
  );

  if (!!componentSchematic) {
    let componentSchematicSub = registerSchematic(
      "extension.componentSchematic",
      initialisationOutput,
      componentSchematic
    );

    context.subscriptions.push(componentSchematicSub);
  }

  const moduleSchematic = schematics.find(
    (schematic) => schematic.name === "module"
  );

  if (!!moduleSchematic) {
    let moduleSchematicSub = registerSchematic(
      "extension.moduleSchematic",
      initialisationOutput,
      moduleSchematic
    );

    context.subscriptions.push(moduleSchematicSub);
  }

  const nestControllerSchematic = schematics.find(
    (schematic) => schematic.name === "nest-controller"
  );

  if (!!nestControllerSchematic) {
    let nestControllerSchematicSub = registerSchematic(
      "extension.nestControllerSchematic",
      initialisationOutput,
      nestControllerSchematic
    );

    context.subscriptions.push(nestControllerSchematicSub);
  }

  await registerAllSchematics(initialisationOutput, schematics);
}

async function registerAllSchematics(
  initialisationOutput: InitialisationOutput,
  schematics: Schematic[]
) {
  return vscode.commands.registerCommand(
    "extension.allSchematics",
    async (context) => {
      const schematicNames = schematics.map((schematic) => schematic.name);

      const chosenSchematicName = await vscode.window.showQuickPick(
        schematicNames
      );

      if (!chosenSchematicName) {
        return;
      }

      const chosenSchematic = schematics.find(
        (schematic) => schematic.name === chosenSchematicName
      );

      if (!!chosenSchematic) {
        await createSchematicSteps(
          context,
          initialisationOutput,
          chosenSchematic
        );
      }
    }
  );
}

function registerSchematic(
  extensionName: string,
  initialisationOutput: InitialisationOutput,
  schematic: Schematic
) {
  return vscode.commands.registerCommand(extensionName, async (context) => {
    await createSchematicSteps(context, initialisationOutput, schematic);
  });
}

async function createSchematicSteps(
  context: any,
  initialisationOutput: InitialisationOutput,
  schematic: Schematic
) {
  const root = getRoot();
  const rootRelativePath = path.relative(root, context.fsPath);

  const angularJson = await vscode.workspace.findFiles("angular.json");
  const angularJsonContents = JSON.parse(
    fs.readFileSync(angularJson[0].fsPath).toString()
  );

  const projects = Object.getOwnPropertyNames(angularJsonContents.projects);

  const projectName = projects.find((project) => {
    const projectOptions = angularJsonContents.projects[project];
    if (rootRelativePath.includes(projectOptions.sourceRoot)) {
      return true;
    } else {
      return false;
    }
  }) as string;

  const project = angularJsonContents.projects[projectName];

  const sourceRelativePath = rootRelativePath
    .replace(`${project.sourceRoot}${path.sep}${project.prefix}${path.sep}`, "")
    .replace(/\\/g, "/");

  const componentName = await vscode.window.showInputBox({
    prompt: `Name of the ${schematic.name}?`,
    ignoreFocusOut: true,
  });

  if (!componentName) {
    return;
  }

  const requiredOptions = schematic.arguments
    .map(
      (argument) =>
        `--${argument.name}=${
          argument.type !== "boolean"
            ? `"${argument.defaultValue}"`
            : `${argument.defaultValue}`
        }`
    )
    .join(" ");

  const initialSchematicOptions = `--projectName="${projectName}" --path="${sourceRelativePath}" --name="${componentName}" ${requiredOptions}`;

  const schematicOptions = await vscode.window.showInputBox({
    prompt:
      "Options for the schematic, you can this to review and manually edit before running the schematic",
    value: initialSchematicOptions,
    ignoreFocusOut: true,
  });

  const terminal = vscode.window.createTerminal("schematic");

  terminal.show();

  terminal.sendText(
    `${initialisationOutput.commandPrefix} ${schematic.command} ${schematicOptions}`
  );
}

function getSchematics(
  initialisationOutput: InitialisationOutput,
  extensionName: string
): Schematic[] {
  const schematicFolderPath =
    initialisationOutput.nodeModulesPath + path.sep + extensionName;

  const schematicFolderExists = fs.existsSync(schematicFolderPath);

  if (!schematicFolderExists) {
    return [];
  }

  const schematicSrcFolderPath = schematicFolderPath + path.sep + "src";

  const collectionJson = fs
    .readFileSync(schematicSrcFolderPath + path.sep + "collection.json")
    .toString();

  const collectionJsonContents = JSON.parse(collectionJson);

  const schematics = collectionJsonContents.schematics;

  const schematicNames = Object.getOwnPropertyNames(schematics);

  return schematicNames.map((schematicName) => {
    const schematic = schematics[schematicName];

    const schemaJson = getSchemaJson(schematicSrcFolderPath, schematic.schema);

    return {
      name: schematicName,
      command:
        schematic.aliases.length > 0 ? schematic.aliases[0] : schematicName,
      arguments: getSchematicArguments(schemaJson),
    };
  });
}

function getSchemaJson(
  schematicSrcFolderPath: string,
  schematicSchema: string
) {
  const schemaJsonRaw = fs
    .readFileSync(schematicSrcFolderPath + path.sep + schematicSchema)
    .toString();

  return JSON.parse(schemaJsonRaw);
}

function getSchematicArguments(schemaJson: any): Argument[] {
  return schemaJson.required
    .filter(
      (requiredStr: string) =>
        requiredStr !== "projectName" &&
        requiredStr !== "path" &&
        requiredStr !== "name"
    )
    .map((requiredStr: string) => ({
      name: requiredStr,
      type: schemaJson.properties[requiredStr].type,
      defaultValue: getDefaultValue(schemaJson.properties[requiredStr]),
    }));
}

function getDefaultValue(property: any) {
  return !!property.default
    ? property.default
    : createDefaultValueFromType(property.type);
}

function createDefaultValueFromType(type: string) {
  switch (type) {
    case "string":
      return "";
    case "int":
      return "0";
    case "boolean":
      return "false";
    default:
      return "";
  }
}
