import { DbnkCtx, DbnkCtxPart } from "./dbnk-ctx";

export class DbnkCmd {
  get cmd() {
    return this._cmd;
  }

  private constructor(private readonly _cmd: string) {}

  //
  // Factory Methods
  //
  public static fromCtxPath(ctx: DbnkCtx, ctxPath: string) {
    const ctxPathArr = ctxPath.split(".");
    const ctxPathNextPart = ctxPathArr.shift();
    return DbnkCmd.fromCtxPartAndPathArr(ctx[ctxPathNextPart], ctxPathArr);
  }

  private static fromCtxPartAndPathArr(
    ctx: DbnkCtxPart,
    ctxPathArr: string[],
    cumulativeCmd: string = ""
  ) {
    if (ctx.cmd === undefined) throw new Error("no cmd");

    let currentCmd = ctx.cmd;
    // TODO: Resolve variables
    // Throw if no variable

    const finalCtxCmd = `${cumulativeCmd}${currentCmd}`

    if (ctxPathArr.length === 0) return new DbnkCmd(finalCtxCmd);

    const ctxPathNextPart = ctxPathArr.shift();
    if (ctx.ctx[ctxPathNextPart] === undefined) throw new Error(`ctx on path doesn't exist`);

    return DbnkCmd.fromCtxPartAndPathArr(
      ctx.ctx[ctxPathNextPart],
      ctxPathArr,
      finalCtxCmd
    );
  }
}
