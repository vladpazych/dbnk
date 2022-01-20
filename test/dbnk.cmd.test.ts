import { suite, test } from "@testdeck/mocha";
import * as _chai from "chai";
import { mock, instance } from "ts-mockito";
import { Dbnk } from "../src/dbnk";
import { DbnkCtx } from "../src/dbnk-ctx";

_chai.should();

abstract class DbnkTests {
  protected SUT: Dbnk;
}

@suite
class DbnkCmdTests extends DbnkTests {
  before() {
    const validContexts: DbnkCtx = {
      c1: {
        cmd: "one",
        ctx: {
          c2: {
            cmd: " two",
            ctx: {
              c3: {
                cmd: " three",
              },
            },
          },
        },
      },
    };

    this.SUT = Dbnk.fromCtx(validContexts);
  }

  @test "should create cumulative cmd"() {
    this.SUT.cmd("c1.c2.c3").toString().should.be.equal("one two three");
  }

  @test "should create cumulative cmd with final piece"() {
    this.SUT.cmd("c1.c2.c3", " final")
      .toString()
      .should.be.equal("one two three final");
  }

  @test "should throw 'CtxDoesNotExistOnPath'"() {
    (() => {
      this.SUT.cmd("c1.c4.c3");
    }).should.throw(Error, "CtxDoesNotExistOnPath");

    (() => {
      this.SUT.cmd("c1.c2.c3.c4");
    }).should.throw(Error, "CtxDoesNotExistOnPath");
  }
}

@suite
class DbnkCmdVariableTests extends DbnkTests {
  @test "should resolve variable"() {
    const validContexts: DbnkCtx = {
      c1: {
        cmd: "one $(foo)",
        var: {
          foo: "oneFoo",
        },
        ctx: {
          c2: {
            cmd: " two",
          },
        },
      },
    };

    const SUT = Dbnk.fromCtx(validContexts);
    SUT.cmd("c1.c2").toString().should.be.equal("one oneFoo two");
  }

  @test "should resolve multiple variables"() {
    const validContexts: DbnkCtx = {
      c1: {
        cmd: "one $(foo) $(foo) $(bar)",
        var: {
          foo: "oneFoo",
        },
        ctx: {
          c2: {
            cmd: " two",
            var: {
              bar: "twoBar",
            },
          },
        },
      },
    };

    const SUT = Dbnk.fromCtx(validContexts);
    SUT.cmd("c1.c2").toString().should.be.equal("one oneFoo oneFoo twoBar two");
  }

  @test "should resolve variables overriden by ctx child"() {
    const validContexts: DbnkCtx = {
      c1: {
        cmd: "one $(foo) $(foo) $(bar)",
        var: {
          foo: "oneFoo",
        },
        ctx: {
          c2: {
            cmd: " two",
            var: {
              bar: "twoBar",
              foo: "twoFoo",
            },
          },
        },
      },
    };

    const SUT = Dbnk.fromCtx(validContexts);
    SUT.cmd("c1.c2").toString().should.be.equal("one twoFoo twoFoo twoBar two");
  }

  @test "should resolve variables overriden by another ctx"() {
    const validContexts: DbnkCtx[] = [
      {
        c1: {
          cmd: "one $(foo) $(foo) $(bar)",
          var: {
            foo: "oneFoo",
          },
          ctx: {
            c2: {
              cmd: " two",
              var: {
                bar: "twoBar",
              },
            },
          },
        },
      },
      {
        c1: {
          var: {
            foo: "twoFoo",
            bar: "otherBar", // Should not override because it's lower in hierarchy
          },
        },
      },
    ];

    const SUT = Dbnk.fromCtx(...validContexts);
    SUT.cmd("c1.c2").toString().should.be.equal("one twoFoo twoFoo twoBar two");
  }
}
