import { DbnkCtx, DbnkCtxPart } from "./dbnk-ctx";
import { promisify } from "util";
import { exec } from "child_process";

const execPromise = promisify(exec);

export class DbnkCmd {
  private constructor(
    private readonly _cmd: string,
    private readonly _cmdFinal: string
  ) {}

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
      ctxPathArr
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

    return new DbnkCmd(resolvedCmd.cmd, cmdFinal);
  }

  private static finalCmdFromCtxPartAndPathArr(
    ctxPart: DbnkCtxPart,
    ctxPathArr: string[]
  ): DbnkCtxPart {
    let currentCmd = ctxPart.cmd || "";
    let currentVar = ctxPart.var || {};

    if (ctxPathArr.length === 0) {
      // If portal is present on the deepest level, we have to remove it
      if (currentCmd.indexOf("$<>") === -1) {
        currentCmd = currentCmd.replace("$<>", "");
      }

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
      ctxPathArr
    );

    // Add default portal if it's not present
    if (currentCmd.indexOf("$<>") === -1) {
      currentCmd = `${currentCmd}$<>`;
    }

    const finalCmd = currentCmd.replace("$<>", nestedCtxResolved.cmd);
    const finalVar = { ...currentVar, ...nestedCtxResolved.var };

    return {
      cmd: finalCmd,
      var: finalVar,
    };
  }

  private static fromCtxPartAndPathArr(
    ctx: DbnkCtxPart,
    ctxPathArr: string[],
    cumulativeCmd: string,
    cumulativeVar: { [key: string]: string },
    cmdFinal: string
  ) {
    if (ctx.cmd === undefined) throw new Error("no cmd");

    const currentCmd = ctx.cmd || "";
    const currentVar = ctx.var || {};

    let finalCtxCmd = `${cumulativeCmd}${currentCmd}`;

    if (cumulativeCmd.indexOf("$<>") !== -1) {
      finalCtxCmd = cumulativeCmd.replace("$<>", currentCmd);
    }

    const finalCtxVar = { ...cumulativeVar, ...currentVar };

    if (ctxPathArr.length === 0) {
      let finalCtxCmdWithResolvedVars = finalCtxCmd;
      const varOccurances = finalCtxCmd.match(/\$\[\w*\]/g);

      if (varOccurances) {
        for (const varOccurance of varOccurances) {
          const varKey = varOccurance.replace(/[\$\[\]]/g, "");
          const varReplacer = finalCtxVar[varKey];

          if (varReplacer === undefined) {
            throw new Error(`UnknownVarUsage: ${varKey}`);
          }

          finalCtxCmdWithResolvedVars = finalCtxCmdWithResolvedVars.replace(
            varOccurance,
            varReplacer
          );
        }
      }

      return new DbnkCmd(finalCtxCmdWithResolvedVars, cmdFinal);
    }

    const ctxPathNextPart = ctxPathArr.shift();
    if (ctx.ctx === undefined || ctx.ctx[ctxPathNextPart] === undefined) {
      throw new Error(`CtxDoesNotExistOnPath`);
    }

    return DbnkCmd.fromCtxPartAndPathArr(
      ctx.ctx[ctxPathNextPart],
      ctxPathArr,
      finalCtxCmd,
      finalCtxVar,
      cmdFinal
    );
  }

  //
  // Utility Methods
  //
  toString() {
    return `${this._cmd}${this._cmdFinal}`;
  }

  exec() {
    return execPromise(this.toString());
  }
}
