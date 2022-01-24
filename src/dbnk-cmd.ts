import { DbnkCtx, DbnkCtxPart } from "./dbnk-ctx";
import { promisify } from "util";
import { exec } from "child_process";

const execPromise = promisify(exec);

export class DbnkCmd {
  private constructor(private readonly _cmd: string) {}

  //
  // Factory Methods
  //
  public static fromCtxPath(
    ctx: DbnkCtx,
    ctxPath: string,
    cmdFinal: string = ""
  ): DbnkCmd {
    const ctxPathArr = ctxPath.split(".");
    const ctxPathNextPart = ctxPathArr.shift();

    const resolvedCmd = DbnkCmd.finalCmdFromCtxPartAndPathArr(
      ctx[ctxPathNextPart],
      ctxPathArr,
      cmdFinal
    );

    // Resolve vars in the final Cmd
    const varOccurances = resolvedCmd.cmd.match(/\$\[\w*\]/g);
    if (varOccurances) {
      for (const varOccurance of varOccurances) {
        const varKey = varOccurance.replace(/[\$\[\]]/g, "");
        const varReplacer = resolvedCmd.var[varKey];

        if (varReplacer === undefined) {
          throw new Error(`UnknownVarUsage: ${varKey}`);
        }

        resolvedCmd.cmd = resolvedCmd.cmd.replace(varOccurance, varReplacer);
      }
    }

    return new DbnkCmd(resolvedCmd.cmd);
  }

  private static finalCmdFromCtxPartAndPathArr(
    ctxPart: DbnkCtxPart,
    ctxPathArr: string[],
    lastCmd: string = ""
  ): DbnkCtxPart {
    let currentCmd = ctxPart.cmd || "";
    let currentVar = ctxPart.var || {};

    // Add default portal if it's not present
    if (currentCmd.indexOf("$<>") === -1) {
      currentCmd = `${currentCmd}$<>`;
    }

    if (ctxPathArr.length === 0) {
      currentCmd = currentCmd.replace("$<>", lastCmd);

      return {
        cmd: currentCmd,
        var: currentVar,
      };
    }

    const nestedCtxPath = ctxPathArr.shift();

    if (ctxPart.ctx === undefined || ctxPart.ctx[nestedCtxPath] === undefined) {
      throw new Error(`CtxDoesNotExistOnPath`);
    }

    const nestedCtxResolved = DbnkCmd.finalCmdFromCtxPartAndPathArr(
      ctxPart.ctx[nestedCtxPath],
      ctxPathArr,
      lastCmd
    );

    const finalCmd = currentCmd.replace("$<>", nestedCtxResolved.cmd);
    const finalVar = { ...currentVar, ...nestedCtxResolved.var };

    return {
      cmd: finalCmd,
      var: finalVar,
    };
  }

  //
  // Utility Methods
  //
  toString() {
    return `${this._cmd}`;
  }

  exec() {
    return execPromise(this.toString());
  }
}
