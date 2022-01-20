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
class DbnkInspectTests extends DbnkTests {
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

  @test "dbnk inspect should consist of cumulative bins"() {
    this.SUT.cmd('c1.c2.c3').should.be.equal('one two three')
  }
}
