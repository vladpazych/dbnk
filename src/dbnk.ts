import { DbnkContext } from "./dbnk-context";

// TODO: Add piping with context tree (more deep, more specific)
// Ctx to have optional sub contexts
// dbnk.sub('some').execute('cmd');
// Thus we can have native and docker executions easily
// first layer would define local or remote, second - native or docker and so on

// we should have cumulative configs, so that some options are hidden and local to machine, like pem key

// Contexts in oracle can be with dot like node1.docker and node3 - dbnk node1.docker is compound context to execute something inside
// Also node1.network - have some paramenters, or different docker image
// Also node1.wallet - have some different paramenters, or different docker image

export class Dbnk {
  /// Copy of the context
  public get context() {
    return Object.assign({}, this._context);
  }

  private constructor(private readonly _context: DbnkContext) {}

  //
  // Factory Methods
  // 
  public static fromFile(configFile: string) {
    //
  }

  public static fromFiles(...configFile: string[]) {
    //
  }

  public static fromContext(context: DbnkContext) {
    return new Dbnk(context); 
  }

  public static fromContexts(...contexts: DbnkContext[]) {}

  private static ensureValidContext(context: {}) {
    return context as DbnkContext;
  }

  //
  // Public Methods
  //
  info() {}

  execute(subcontext: string, cmd: string) {}
}
