export interface Schematic {
  name: string;
  command: string;
  arguments: Argument[];
}

export interface Argument {
  name: string;
  type: string;
  defaultValue: string;
}
