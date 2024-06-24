import Binaryen from "../deps/binaryen.ts";
const { i32, none, f32 } = Binaryen;
import Environment from "./environment.js";
import Stack from "./stack.js";
import Memory from "./memory.js";
import ConstantDeclaration from "./constant-declaration.js";
import TypeDeclaration from "./type-declaration.js";

var pages = 2500;

export default class Program {
  /**
   * @param {any} labels
   * @param {ConstantDeclaration[]} consts
   * @param {TypeDeclaration[]} types
   * @param {any} vars
   * @param {any} pfs
   * @param {import("./statements/compound.js").default} compound
   * @param {undefined} [parent]
   */
  constructor(labels, consts, types, vars, pfs, compound, parent) {
    this.labels = labels;
    this.consts = consts;
    this.types = types;
    this.vars = vars;
    this.pfs = pfs;
    this.compound = compound;
    this.parent = parent;
    /** @type {Memory|undefined} */
    this.memory = undefined;
    /** @type {Stack|undefined} */
    this.stack = undefined;
    this.traces = [];
  }

  /**
   * @param {Environment} environment
   */
  generate(environment) {
    environment = new Environment(environment);
    environment.program = this;

    var module = environment.module;

    this.memory = new Memory(module, pages);
    this.stack = new Stack(module, this.memory);

    this.consts.forEach(function (v) {
      environment.constants[v.name] = v.expression;
    });

    this.types.forEach(
      function (/** @type {{ name: string | number; expression: any; }} */ t) {
        environment.types[t.name] = t.expression;
      },
    );

    for (var j in this.vars) {
      var v = this.vars[j];
      for (var i in v.names) {
        var name = v.names[i].name;
        var type = environment.resolveType(v.type);

        environment.variables[name] = this.memory.allocateVariable(name, type);
      }
    }

    this.pfs.forEach(
      function (/** @type {{ generate: (arg0: any) => void; }} */ v) {
        v.generate(environment);
      },
    );

    module.addGlobal("trampoline", i32, true, module.i32.const(-1));

    var e = this.compound.generate(environment);

    var f = module.addFunctionType(null, none, []);
    var main = module.addFunction("main", f, [], e);

    //module.setStart(main);
    module.addFunctionExport("main", "main");

    module.addFunctionImport(
      "start_unwind",
      "asyncify",
      "start_unwind",
      module.addFunctionType(null, none, [i32]),
    );
    module.addFunctionImport(
      "stop_unwind",
      "asyncify",
      "stop_unwind",
      module.addFunctionType(null, none, []),
    );
    module.addFunctionImport(
      "start_rewind",
      "asyncify",
      "start_rewind",
      module.addFunctionType(null, none, [i32]),
    );
    module.addFunctionImport(
      "stop_rewind",
      "asyncify",
      "stop_rewind",
      module.addFunctionType(null, none, []),
    );

    module.addFunctionImport(
      "printInteger",
      "library",
      "printInteger",
      module.addFunctionType(null, none, [i32, i32]),
    );
    module.addFunctionImport(
      "printBoolean",
      "library",
      "printBoolean",
      module.addFunctionType(null, none, [i32, i32]),
    );
    module.addFunctionImport(
      "printChar",
      "library",
      "printChar",
      module.addFunctionType(null, none, [i32, i32]),
    );
    module.addFunctionImport(
      "printString",
      "library",
      "printString",
      module.addFunctionType(null, none, [i32, i32]),
    );
    module.addFunctionImport(
      "printFloat",
      "library",
      "printFloat",
      module.addFunctionType(null, none, [i32, f32]),
    );
    module.addFunctionImport(
      "printNewline",
      "library",
      "printNewline",
      module.addFunctionType(null, none, [i32]),
    );

    module.addFunctionImport(
      "reset",
      "library",
      "reset",
      module.addFunctionType(null, i32, [i32, i32]),
    );

    module.addFunctionImport(
      "getfilesize",
      "library",
      "getfilesize",
      module.addFunctionType(null, i32, [i32, i32]),
    );

    module.addFunctionImport(
      "snapshot",
      "library",
      "snapshot",
      module.addFunctionType(null, i32, []),
    );

    module.addFunctionImport(
      "inputln",
      "library",
      "inputln",
      module.addFunctionType(null, i32, [i32, i32, i32, i32, i32, i32, i32]),
    );

    module.addFunctionImport(
      "evaljs",
      "library",
      "evaljs",
      module.addFunctionType(null, none, [
        i32,
        i32,
        i32,
        i32,
        i32,
        i32,
        i32,
        i32,
        i32,
        i32,
      ]),
    );

    module.addFunctionImport(
      "rewrite",
      "library",
      "rewrite",
      module.addFunctionType(null, i32, [i32, i32]),
    );

    module.addFunctionImport(
      "get",
      "library",
      "get",
      module.addFunctionType(null, none, [i32, i32, i32]),
    );

    module.addFunctionImport(
      "put",
      "library",
      "put",
      module.addFunctionType(null, none, [i32, i32, i32]),
    );

    module.addFunctionImport(
      "eof",
      "library",
      "eof",
      module.addFunctionType(null, i32, [i32]),
    );

    module.addFunctionImport(
      "eoln",
      "library",
      "eoln",
      module.addFunctionType(null, i32, [i32]),
    );

    module.addFunctionImport(
      "erstat",
      "library",
      "erstat",
      module.addFunctionType(null, i32, [i32]),
    );

    module.addFunctionImport(
      "close",
      "library",
      "close",
      module.addFunctionType(null, none, [i32]),
    );

    module.addFunctionImport(
      "getCurrentMinutes",
      "library",
      "getCurrentMinutes",
      module.addFunctionType(null, i32, []),
    );

    module.addFunctionImport(
      "getCurrentDay",
      "library",
      "getCurrentDay",
      module.addFunctionType(null, i32, []),
    );

    module.addFunctionImport(
      "getCurrentMonth",
      "library",
      "getCurrentMonth",
      module.addFunctionType(null, i32, []),
    );

    module.addFunctionImport(
      "getCurrentYear",
      "library",
      "getCurrentYear",
      module.addFunctionType(null, i32, []),
    );

    this.memory.setup();

    return module;
  }
}
