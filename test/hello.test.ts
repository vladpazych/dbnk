import { suite, test } from "@testdeck/mocha";
import * as _chai from "chai";
import { mock, instance } from "ts-mockito";
import { Dbnk } from "../src/dbnk";

_chai.should();

@suite
class DbnkUnitTests {
  private SUT: Dbnk;

  before() {
    this.SUT = Dbnk.fromContext({});
  }

  @test "should do something when call a method"() {
    this.SUT.should.be.not.undefined;
    this.SUT.should.be.not.undefined;


  }
}
