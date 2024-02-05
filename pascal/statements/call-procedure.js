import Binaryen from 'binaryen';
const { i32,  none} = Binaryen;
import Environment from '../environment.js';
import FunctionEvaluation from '../function-evaluation.js';
import Assignment from './assignment.js';
import Pointer from '../pointer.js';

var count = 0;

/** @typedef{import("../statement.js").Statement} Statement */

/** @implements{Statement} */
export default class CallProcedure {
  /**
   * @param {any} procedure
   * @param {never[]} params
   */
  constructor(procedure,params) {
    this.procedure = procedure;
    this.params = params;
  }

  /** @returns {string[]} */
  gotos() {
    return [];
  }

  /**
   * @param {Environment} environment
   * @returns {number}
   */
  generate(environment) {
    var module = environment.module;

    // No need for "break-in" functions
    if (this.procedure.name.toLowerCase() == "break") {
      return module.nop();
    }
    if (this.procedure.name.toLowerCase() == "breakin") {
      return module.nop();
    }
    if (this.procedure.name.toLowerCase() == "break_in") {
      return module.nop();
    }

    // Ignore the mode parameter to reset
    if ((this.procedure.name.toLowerCase() == "reset") || (this.procedure.name.toLowerCase() == "get")) {
      var commands = [];

      if (this.procedure.name.toLowerCase() == "reset") {
        var file = this.params[0];
        file.generate(environment);

        var filename = this.params[1];
        var filenameExp = filename.generate(environment);
        var result = undefined;

        if (filename.type.name == "string") {
          result = module.call( "reset", [module.i32.load8_u(0,0,filenameExp),
                                          module.i32.add(module.i32.const(1),filenameExp)],
                                i32 );
        } else {
          result = module.call( "reset", [module.i32.const(filename.type.index.range()),
                                          filename.variable.pointer()],
                                i32 );
        }

        commands.push( file.variable.set( result ) );
      }

      var file = this.params[0];
      var descriptor = file.generate(environment);
      var fileType = environment.resolveType( file.type );

      var data = module.i32.add( module.i32.const(4),
                                 file.variable.pointer() );

      commands.push( module.call( "get",
                                  [descriptor, data, module.i32.const(fileType.type.bytes())],
                                  none ) );

      return module.block( null, commands );
    }

    // Ignore the mode parameter to reset
    if (this.procedure.name.toLowerCase() == "rewrite") {
      var file = this.params[0];
      file.generate(environment);

      var filename = this.params[1];
      var filenameExp = filename.generate(environment);
      var result = undefined;

      if (filename.type.name == "string") {
        result = module.call( "rewrite", [module.i32.load8_u(0,0,filenameExp),
                                        module.i32.add(module.i32.const(1),filenameExp)],
                              i32 );
      } else {
        result = module.call( "rewrite", [module.i32.const(filename.type.index.range()),
                                          filename.variable.pointer()],
                              i32 );
      }

      return file.variable.set( result );
    }

    if (this.procedure.name == "uexit") {
      return module.unreachable();
    }

    if (this.procedure.name == "evaljs") {
      var str_number = this.params[0];
      var str_pool = this.params[1];
      var str_start = this.params[2];
      var pool_ptr = this.params[3];
      var pool_size = this.params[4];
      var max_strings = this.params[5];

      var eqtb = this.params[6];
      var active_base = this.params[7];
      var eqtb_size = this.params[8];
      var count_base = this.params[9];

      eqtb.generate(environment);
      str_pool.generate(environment);
      str_start.generate(environment);
      pool_ptr.generate(environment);
      console.log('eqtb=',eqtb);

      return module.call( "evaljs", [str_number.generate(environment),
                                       str_pool.variable.pointer(),
                                       str_start.variable.pointer(),
                                       pool_ptr.variable.pointer(),
                                       pool_size.generate(environment),
                                       max_strings.generate(environment),
                                       eqtb.variable.pointer(),
                                       active_base.generate(environment),
                                       eqtb_size.generate(environment),
                                       count_base.generate(environment)
                                      ],
                            none );
    }

    if ((this.procedure.name == "readln") || (this.procedure.name == "read_ln") || (this.procedure.name == "read")) {
      var file = undefined;
      var commands = [];

      var descriptor;
      var fileType;
      var data;

      this.params.forEach( function(/** @type {import("../desig.js").default} */ p) {
        var q = p.generate(environment);
        var type = environment.resolveType( p.type );

        var reader = undefined;

        if (type.fileType) {
          file = p;
          descriptor = file.generate(environment);
          fileType = environment.resolveType( file.type );

          data = module.i32.add( module.i32.const(4),
                                 file.variable.pointer() );
        } else {
          if (file) {
            var width = module.i32.const( type.bytes() );
            var pointer = p.variable.pointer();

            var assignment = new Assignment( p, new Pointer( file ) );
            commands.push( assignment.generate(environment) );

            commands.push( module.call( "get",
                                        [descriptor, data, module.i32.const(fileType.type.bytes())],
                                        none ) );
          }
        }
      });

      if ((this.procedure.name == "readln") || (this.procedure.name == "read_ln")) {
        if (file) {
          var loopLabel = `readln${count}`;
          var blockLabel = `readln${count}-done`;
          count = count + 1;

          var condition = module.i32.eq( module.call( "eoln", [descriptor], i32 ),
                                         module.i32.const( 0 ) );

          var getMore = module.call( "get",
                                     [descriptor, data, module.i32.const(fileType.type.bytes())],
                                     none );

          var loop = module.block( blockLabel,
                                   [ module.loop( loopLabel,
                                                  module.if( condition,
                                                             module.block( null, [ getMore,
                                                                                   module.break( loopLabel ) ] ),
                                                             module.break( blockLabel ) )
                                                ) ] );

          var skip = module.call( "get",
                                  [descriptor, data, module.i32.const(fileType.type.bytes())],
                                  none );

          commands.push( module.block( null, [loop, skip] ) );
        }
      }

      return module.block( null, commands );
    }


    // FIXME
    if (this.procedure.name == "put") {
      var file = this.params[0];
      var descriptor = file.generate(environment);
      var fileType = environment.resolveType( file.type );

      var data = module.i32.add( module.i32.const(4),
                                 file.variable.pointer() );

      return module.call( "put",
                          [descriptor, data, module.i32.const(fileType.type.bytes())],
                          none );
    }

    if (this.procedure.name == "close") {
      var file = this.params[0];

      return module.call( "close", [file.generate(environment)],
                          i32 );
    }


    if ((this.procedure.name == "writeln") || (this.procedure.name == "write_ln") || (this.procedure.name == "write")) {
      var file = undefined;

      var printers = this.params.map( function(/** @type {{ width: any; expression: any; generate: (arg0: any) => any; type: any; }} */ p) {
        if (p.width)
          p = p.expression;

        var q = p.generate(environment);
        var type = environment.resolveType( p.type );

        var printer = undefined;

        if (type.fileType) {
          file = q;
          return module.nop();
        }

        if (type.isInteger())
          printer = "printInteger";

        if (type.name == "real")
          printer = "printFloat";

        if (type.name == "boolean")
          printer = "printBoolean";

        if (type.name === "string")
          printer = "printString";

        if (type.name === "char")
          printer = "printChar";

        if (type.bytes() == 1)
          printer = "printChar";

        if (printer === undefined)
          throw 'Could not print.';

        if (file)
          return module.call( printer, [file, q], none );
        else
          return module.call( printer, [module.i32.const(-1), q], none );
      });

      if ((this.procedure.name == "writeln") || (this.procedure.name == "write_ln")) {
        if (file)
          printers.push( module.call( "printNewline", [file], none ) );
        else
          printers.push( module.call( "printNewline", [module.i32.const(-1)], none ) );
      }

      return module.block( null, printers );
    }

    var f = new FunctionEvaluation( this.procedure, this.params );

    var code = f.generate(environment);

    if (f.type == undefined)
      return code;
    else
      return module.drop(code);
  }
};
