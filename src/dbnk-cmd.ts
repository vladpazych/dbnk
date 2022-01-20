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
    return DbnkCmd.fromCtxPartAndPathArr(
      ctx[ctxPathNextPart],
      ctxPathArr,
      "",
      {},
      cmdFinal
    );
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

    const finalCtxCmd = `${cumulativeCmd}${currentCmd}`;
    const finalCtxVar = { ...cumulativeVar, ...currentVar };

    if (ctxPathArr.length === 0) {
      let finalCtxCmdWithResolvedVars = finalCtxCmd;
      const varOccurances = finalCtxCmd.match(/\$\(\w*\)/g);

      if (varOccurances) {
        for (const varOccurance of varOccurances) {
          const varKey = varOccurance.replace(/[\$()]/g, "");
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
