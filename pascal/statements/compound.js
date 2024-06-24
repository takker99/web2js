import Environment from "../environment.js";
import Binaryen from "../../deps/binaryen.ts";
const { i32 } = Binaryen;

let trampoline = 1;
let targets = 1;

/** @typedef{import("../statement.ts").Statement} Statement */

/** @implements{Statement} */
export default class Compound {
  /**
   * @param {Statement[]} statements
   */
  constructor(statements) {
    this.statements = statements;
  }

  /** @returns {string[]} */
  gotos() {
    /**
     * @type {any[]}
     */
    var g = [];
    this.statements.forEach(function (/** @type {{ gotos: () => any; }} */ f) {
      g = g.concat(f.gotos());
    });
    return g;
  }

  /**
   * @param {Environment} environment
   */
  generate(environment) {
    environment = new Environment(environment);
    var module = environment.module;

    var labelCount = 0;

    /**
     * @type {any[]}
     */
    var labels = [];
    var target = {};
    this.statements.forEach(
      function (/** @type {{ label: string | number; statement: any; }} */ v) {
        if (v.label && v.statement) {
          labelCount = labelCount + 1;
          labels.push(v.label);
          target[v.label] = `target${targets}`;
          targets++;
        }
      },
    );

    if (labelCount == 0) {
      var commands = this.statements.map(
        function (/** @type {{ generate: (arg0: any) => any; }} */ v) {
          return v.generate(environment);
        },
      );
      return module.block(null, commands);
    }

    var trampolineLabel = `trampoline${trampoline}`;
    trampoline = trampoline + 1;

    this.statements.forEach(
      function (/** @type {{ label: string | number; statement: any; }} */ v) {
        if (v.label && v.statement) {
          environment.labels[v.label] = {
            label: trampolineLabel,
            index: labels.indexOf(v.label),
            generate: function (/** @type {{ module: any; }} */ environment) {
              var m = environment.module;
              return m.block(null, [
                m.global.set("trampoline", m.i32.const(this.index)),
                m.break(this.label),
              ]);
            },
          };
        }
      },
    );

    var branch = [
      module.if(
        module.i32.ge_s(
          module.global.get("trampoline", i32),
          module.i32.const(0),
        ),
        module.switch(
          labels.map(function (l) {
            return target[l];
          }),
          trampolineLabel,
          module.global.get("trampoline", i32),
        ),
      ),
    ];

    this.statements.forEach(
      function (
        /** @type {{ label: string | number; statement: any; generate: (arg0: any) => any; }} */ v,
      ) {
        if (v.label && v.statement) {
          branch = [module.block(target[v.label], branch)];
        }

        branch.push(v.generate(environment));
      },
    );

    return module.block(null, [
      module.global.set("trampoline", module.i32.const(-1)),
      module.loop(trampolineLabel, module.block(null, branch)),
    ]);
  }
}
