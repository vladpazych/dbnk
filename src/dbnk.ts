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
    return new Dbnk(merge({}, ...ctx));
  }

  // private static validateContext(rawContext: {}) {
  //   for (const [key, value] of Object.entries(rawContext)) {
  //     if (typeof key !== "string") return false;
  //     if (
  //       typeof value["contexts"] !== undefined &&
  //       typeof value["contexts"] !== "object"
  //     )
  //       return false;
  //     if (typeof value["contexts"] === "object")
  //       return this.validateContext(value["contexts"]);
  //   }
  //   return rawContext as DbnkContexts;
  // }

  //
  // Public Methods
  //
  info() {}

  cmd(ctxPath: string) {
    return DbnkCmd.fromCtxPath(this.ctx, ctxPath).cmd;
  }
}
