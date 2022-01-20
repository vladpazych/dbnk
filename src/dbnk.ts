import { DbnkCtx } from "./dbnk-ctx";
import { DbnkCmd } from "./dbnk-cmd";
import { merge } from "lodash";

export class Dbnk {
  /// Deep copy of the ctx
  public get ctx(): DbnkCtx {
    return JSON.parse(JSON.stringify(this._ctx));
  }

  private constructor(private readonly _ctx: DbnkCtx) {}

  //
  // Factory Methods
  //
  public static fromCtx(...ctx: DbnkCtx[]) {
    return new Dbnk(this.validateCtx(merge({}, ...ctx)));
  }

  private static validateCtx(rawContext: {}) {
    for (const value of Object.values(rawContext)) {
      if (value["cmd"] === undefined) {
        throw new Error("CmdDoesNotExistOnCtx");
      }

      if (value["ctx"] !== undefined && typeof value["ctx"] !== "object") {
        throw new Error("CtxIsNotObjectOrUndefined");
      }

      if (typeof value["ctx"] === "object") {
        this.validateCtx(value["ctx"]);
      }

      if (value["var"] !== undefined && typeof value["var"] !== "object") {
        throw new Error("VarMustBeObject");
      }

      if (typeof value["var"] == "object") {
        for (const varValue of Object.values(value["var"])) {
          if (typeof varValue !== "string") {
            throw new Error("VarValueMustBeString");
          }
        }
      }
    }

    return rawContext as DbnkCtx;
  }

  //
  // Public Methods
  //
  info() {}

  cmd(ctxPath: string, cmd: string = "") {
    return DbnkCmd.fromCtxPath(this.ctx, ctxPath, cmd);
  }
}
