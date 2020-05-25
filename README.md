# Opinionated Schematics for VS Code

[Opinionated Schematics](https://github.com/PaulDLW/opinionated-schematics) are a set of Schematics for Angular and NestJS. They have been written to provide an opinionated way of creating building block for the Angular and NestJS frameworks.

This VS Code extension provides an easy way to use these schematics, by the method of an additional right click context menu.

This extension will only activate when folders are right clicked and a valid workspace is being used.

A valid workspace has the following attributes:

- Is an Angular project
- Has the [Opinionated Schematics](https://github.com/PaulDLW/opinionated-schematics) library installed as a dev dependancy (`npm install -D opinionated-schematics`) and is correctly configurated in the angular.json. See the [documentation](https://github.com/PaulDLW/opinionated-schematics/blob/master/README.md) of the Opinionated Schematics library for more info.
- OR has [Opinionated Schematics CLI](https://github.com/PaulDLW/opinionated-schematics-cli) installed globally (`npm install -g opinionated-schematics-cli`), the benefits of using the CLI is that you do not need to have the opinionated-schematics library listed as a dev dependancy.

## Usage

Right click on a folder and you will be presented with some schematic options. Due to VS Code not being able to currently create sub menus, only the common schematics are explicitly listed (Angular Component and Module, Nest Controller and Module). For all schematics click the `All Schematics` option, you will then be given a dropdown where you can choose the schematic you want to use.

From there choose a name for the schematic (don't append the type, so 'test' rather than 'test-component'). After that all the required parameters will have defaults applied, you can review the arguments list before proceeding and creating the schematic.

A new terminal will then be created so you can see the output of the schematic, see what files have been modified or if there were any errors.

## Notes

If you are using the Opinionated Schematics CLI then currently only Windows and NPM is supported.
