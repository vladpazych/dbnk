import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import * as path from "path";
import * as os from "os";
import * as fs from "fs/promises";
import { Dbnk } from "./dbnk";
import { execSync } from "child_process";

const dirCurrent = path.resolve();
const dirHome = os.homedir();
const fileConfigHome = path.resolve(dirHome, ".dbnk.json");
const fileConfigCurrent = path.resolve(dirCurrent, ".dbnk.json");

let configHome = {};
let configCurrent = {};

(async () => {
  configHome = await parseConfig(fileConfigHome);
  configCurrent = await parseConfig(fileConfigCurrent);
})().then(() => {
  const argv = yargs(hideBin(process.argv))
    .alias("v", "version")
    .help("help").argv;

  if (typeof hideBin(process.argv)[0] === "string") {
    const dbnk = Dbnk.fromCtx(configHome, configCurrent);

    const ctxPath = hideBin(process.argv)[0];
    let finalCmd = "";

    if (typeof hideBin(process.argv)[1] === "string") {
      const cmdArgs = [...hideBin(process.argv)];
      cmdArgs.shift();
      finalCmd = cmdArgs.join(" ");
    }
    
    const thecmd = dbnk.cmd(ctxPath, ` ${finalCmd}`).toString();
    console.log("executing", thecmd);
    console.log(execSync(thecmd).toString());
  }
});

async function parseConfig(pathToConfigFile: string) {
  try {
    const text = await fs.readFile(pathToConfigFile, "utf-8");
    return JSON.parse(text.toString());
  } catch (e) {
    if (e.code === "ENOENT") {
      return "";
    }

    throw e;
  }
}
