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
class DbnkFromValidContextsTests extends DbnkTests {
  before() {
    const validContexts: DbnkCtx[] = [
      { local: { cmd: "prefix" } },
      { local2: { cmd: "prefix2" } },
      { local: { cmd: "prefixOverriden" } },
    ];

    this.SUT = Dbnk.fromCtx(...validContexts);
  }

  @test "should have overriden passed context"() {
    this.SUT.ctx.local.cmd.should.be.equal("prefixOverriden");
  }

  @test "passed context should be a deep copy"() {
    this.SUT.ctx.local.cmd = "prefix2";
    this.SUT.ctx.local.cmd.should.be.equal("prefixOverriden");
  }

  @test "passed context should be created from multiple entries"() {
    this.SUT.ctx.local2.cmd.should.be.equal("prefix2");
  }
}

@suite
class DbnkFromNestedValidContextsTests extends DbnkTests {
  before() {
    const validContexts: DbnkCtx[] = [
      {
        local: {
          cmd: "prefix",
          ctx: {
            nested: {
              cmd: " second prefix",
              var: {
                foo: "foo",
              },
            },
          },
        },
      },
      { local2: { cmd: "prefix2" } },
      { local: { cmd: "prefixOverriden" } },
      { local: { var: { foo: "bar", bar: "foo" } } },
    ];

    this.SUT = Dbnk.fromCtx(...validContexts);
  }

  @test "should have cumulative overriden passed context"() {
    this.SUT.ctx.local.cmd.should.be.equal("prefixOverriden");
    this.SUT.ctx.local.ctx.nested.cmd.should.be.equal(" second prefix");
    this.SUT.ctx.local.var.foo.should.be.equal("bar");
    this.SUT.ctx.local.var.bar.should.be.equal("foo");
  }

  @test "passed context should be a deep copy"() {
    this.SUT.ctx.local.cmd = "prefix2";
    this.SUT.ctx.local.cmd.should.be.equal("prefixOverriden");
  }

  @test "passed context should be created from multiple entries"() {
    this.SUT.ctx.local2.cmd.should.be.equal("prefix2");
  }
}

@suite
class DbnkFromInvalidContextsTests extends DbnkTests {
  @test "should throw 'CmdDoesNotExistOnCtx'"() {
    const invalidContexts: DbnkCtx[] = [
      {
        local: {
          ctx: {
            nested: {
              cmd: "second",
            },
          },
        },
      },
    ];

    (() => {
      this.SUT = Dbnk.fromCtx(...invalidContexts);
    }).should.throw(Error, "CmdDoesNotExistOnCtx");
  }

  @test "should throw 'CtxIsNotObjectOrUndefined'"() {
    const invalidContexts: DbnkCtx[] = [
      {
        local: {
          cmd: "first",
          ctx: 3 as {}
        },
      },
    ];

    (() => {
      this.SUT = Dbnk.fromCtx(...invalidContexts);
    }).should.throw(Error, "CtxIsNotObjectOrUndefined");
  }

  @test "should throw 'VarMustBeObject'"() {
    const invalidContexts: DbnkCtx[] = [
      {
        local: {
          cmd: "first",
          var: "hello" as {}
        },
      },
    ];

    (() => {
      this.SUT = Dbnk.fromCtx(...invalidContexts);
    }).should.throw(Error, "VarMustBeObject");
  }
  
  @test "should throw 'VarValueMustBeString'"() {
    const invalidContexts: DbnkCtx[] = [
      {
        local: {
          cmd: "first",
          var: {
            foo: 'some',
            bar: {} as string,
          }
        },
      },
    ];

    (() => {
      this.SUT = Dbnk.fromCtx(...invalidContexts);
    }).should.throw(Error, "VarValueMustBeString");
  }
}
