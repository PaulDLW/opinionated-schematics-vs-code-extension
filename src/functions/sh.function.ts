const { execSync } = require("child_process");

export function exec(script: string) {
  return execSync(script);
}
