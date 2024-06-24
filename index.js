// @ts-check
import { Lexer } from "./deps/flex-js.js";
import binaryen from "./deps/binaryen.ts";

const lexer = new Lexer();

/**
 * @type {string}
 */
let last_token;

// definitions
lexer.addDefinition("DIGIT", /[0-9]/);
lexer.addDefinition("ALPHA", /[a-zA-Z]/);
lexer.addDefinition("ALPHANUM", /([0-9]|[a-zA-z]|_)/);
lexer.addDefinition("IDENTIFIER", /[a-zA-Z]([0-9]|[a-zA-Z]|_)*/);
lexer.addDefinition("NUMBER", /[0-9]+/);
lexer.addDefinition("SIGN", /(\+|-)/);
lexer.addDefinition("SIGNED", /(\+|-)?[0-9]+/);
lexer.addDefinition(
  "REAL",
  /([0-9]+\.[0-9]+|[0-9]+\.[0-9]+e(\+|-)?[0-9]+|[0-9]+e(\+|-)?[0-9]+)/,
);
lexer.addDefinition("COMMENT", /(({[^}]*})|(\(\*([^*]|\*[^)])*\*\)))/);
lexer.addDefinition("W", /([ \n\t]+)+/);

lexer.addRule("{", (lexer) => {
  while (lexer.input() != "}");
});

lexer.addRule(/{W}/);

//lexer.addRule(/procedure [a-z_]+;[ \n\t]*forward;/);
//lexer.addRule(/function [(),:a-z_]+;[ \n\t]*forward;/);

lexer.addRule("packed", () => "packed");
lexer.addRule("forward", () => "forward");
lexer.addRule("and", () => "and");
lexer.addRule("array", () => "array");
lexer.addRule("begin", () => "begin");
lexer.addRule("case", () => "case");
lexer.addRule("const", () => "const");
lexer.addRule("div", () => "div");
lexer.addRule("do", () => "do");
lexer.addRule("downto", () => "downto");
lexer.addRule("else", () => "else");
lexer.addRule("end", () => "end");
lexer.addRule("file", () => "file");
lexer.addRule("for", () => "for");
lexer.addRule("function", () => "function");
lexer.addRule("goto", () => "goto");
lexer.addRule("if", () => "if");
lexer.addRule("label", () => "label");
lexer.addRule("mod", () => "mod");
lexer.addRule("not", () => "not");
lexer.addRule("of", () => "of");
lexer.addRule("or", () => "or");
lexer.addRule("procedure", () => "procedure");
lexer.addRule("program", () => "program");
lexer.addRule("record", () => "record");
lexer.addRule("repeat", () => "repeat");
lexer.addRule("then", () => "then");
lexer.addRule("to", () => "to");
lexer.addRule("type", () => "type");
lexer.addRule("until", () => "until");
lexer.addRule("var", () => "var");
lexer.addRule("while", () => "while");
lexer.addRule("others", () => "others");
lexer.addRule("true", () => "true");
lexer.addRule("false", () => "false");

lexer.addRule(/'([^']|'')'/, () => "single_char");

lexer.addRule(/'([^']|'')+'/, (lexer) => {
  if ((lexer.text == "''''") || (lexer.text.length == 3)) {
    lexer.reject();
  } else {
    return "string_literal";
  }
});

lexer.addRule("+", () => {
  if (
    (last_token == "identifier") ||
    (last_token == "i_num") ||
    (last_token == "r_num") ||
    (last_token == ")") ||
    (last_token == "]")
  ) {
    return "+";
  } else {
    return "unary_plus";
  }
});

lexer.addRule("-", (lexer) => {
  if (
    (last_token == "identifier") ||
    (last_token == "i_num") ||
    (last_token == "r_num") ||
    (last_token == ")") ||
    (last_token == "]")
  ) {
    return "-";
  } else {
    let c;
    while (((c = lexer.input()) == " ") || (c == "\t"));
    lexer.unput(c);
    if (parseInt(c).toString() != c) {
      return "unary_minus";
    }
    lexer.reject();
  }
});

lexer.addRule(/-?{REAL}/, () => "r_num");

lexer.addRule(/-?{NUMBER}/, (lexer) => {
  if (
    (last_token == "identifier") ||
    (last_token == "i_num") ||
    (last_token == "r_num") ||
    (last_token == ")") ||
    (last_token == "]")
  ) {
    lexer.reject();
  }

  return "i_num";
});

lexer.addRule("*", () => "*");
lexer.addRule("/", () => "/");
lexer.addRule("=", () => "=");
lexer.addRule("<>", () => "<>");
lexer.addRule("<", () => "<");
lexer.addRule(">", () => ">");
lexer.addRule("<=", () => "<=");
lexer.addRule(">=", () => ">=");
lexer.addRule("(", () => "(");
lexer.addRule(")", () => ")");
lexer.addRule("[", () => "[");
lexer.addRule("]", () => "]");
lexer.addRule(":=", () => "assign");
lexer.addRule("..", () => "..");
lexer.addRule(".", () => ".");
lexer.addRule(",", () => ",");
lexer.addRule(";", () => ";");
lexer.addRule(":", () => ":");
lexer.addRule("^", () => "^");

lexer.addRule(/{IDENTIFIER}/, () => "identifier");

lexer.addRule(/./, () => "..");

import {
  closeSync,
  openSync,
  readFileSync,
  readSync,
  writeFileSync,
  writeSync,
  // @ts-ignore
} from "node:fs";
{
  const code = readFileSync(Deno.args[2]).toString();
  lexer.setSource(code);
}

import { parser } from "./parser.js";

// @ts-ignore
parser.lexer = {
  lex: function () {
    const token = lexer.lex();
    last_token = token;
    this.yytext = lexer.text;
    //console.log(lexer.text);
    return token;
  },
  setInput: function () {
  },
};

// @ts-ignore aaa
const program = parser.parse();

/** @type{binaryen.Module} */
const module = program.generate();

//module.optimize();
//module.runPasses(["optimize-stack-ir","simplify-locals","ssa","dfo","const-hoisting","dce"]);
//module.runPasses(["remove-unused-brs","pick-load-signs","precompute","precompute-propagate","code-pushing","duplicate-function-elimination","inlining-optimizing","dae-optimizing","generate-stack-ir","optimize-stack-ir"]);

//fs.writeFileSync( "tex.wast", module.emitText() );
writeFileSync("tex.wabt", module.emitBinary());

// Get the binary in typed array form
// deno-lint-ignore no-unused-vars
const binary = module.emitBinary();
//console.log('binary size: ' + binary.length);
//console.log();

// We don't need the Binaryen module anymore, so we can tell it to
// clean itself up
module.dispose();

const pages = 20;
const memory = new WebAssembly.Memory({ initial: pages, maximum: pages });

/**
 * @type {any[]}
 */
const callstack = [];
/**
 * @type {any[]}
 */
const stackstack = [];

/**
 * @type {{ filename: string; stdin?: boolean; position?: number; descriptor?: number; stdout?: boolean; }[]}
 */
const files = [];

const library = {
  printString: function (
    /** @type {number} */ descriptor,
    /** @type {number} */ x,
  ) {
    var file = (descriptor < 0) ? { stdout: true } : files[descriptor];
    var length = new Uint8Array(memory.buffer, x, 1)[0];
    var buffer = new Uint8Array(memory.buffer, x + 1, length);

    if (file.stdout) {
      Deno.stdout.write(buffer);
      return;
    }

    writeSync(file.descriptor, new TextDecoder().decode(buffer));
  },
  printBoolean: function (
    /** @type {number} */ descriptor,
    /** @type {any} */ x,
  ) {
    var file = (descriptor < 0) ? { stdout: true } : files[descriptor];

    var result = x ? "TRUE" : "FALSE";

    if (file.stdout) {
      Deno.stdout.write(new TextEncoder().encode(result));
      return;
    }

    // @ts-ignore
    writeSync(file.descriptor, result);
  },
  printChar: function (
    /** @type {number} */ descriptor,
    /** @type {number} */ x,
  ) {
    var file = (descriptor < 0) ? { stdout: true } : files[descriptor];
    if (file.stdout) {
      Deno.stdout.write(x);
      return;
    }

    // @ts-ignore
    var b = Buffer.alloc(1);
    b[0] = x;
    // @ts-ignore
    writeSync(file.descriptor, b);
  },
  printInteger: function (
    /** @type {number} */ descriptor,
    /** @type {{ toString: () => string; }} */ x,
  ) {
    var file = (descriptor < 0) ? { stdout: true } : files[descriptor];
    if (file.stdout) {
      Deno.stdout.write(x);
      return;
    }

    // @ts-ignore
    writeSync(file.descriptor, x.toString());
  },
  printFloat: function (
    /** @type {number} */ descriptor,
    /** @type {{ toString: () => string | NodeJS.ArrayBufferView; }} */ x,
  ) {
    var file = (descriptor < 0) ? { stdout: true } : files[descriptor];
    if (file.stdout) {
      // @ts-ignore
      process.stdout.write(x.toString());
      return;
    }

    // @ts-ignore
    writeSync(file.descriptor, x.toString());
  },
  printNewline: function (
    /** @type {number} */ descriptor,
  ) {
    var file = (descriptor < 0) ? { stdout: true } : files[descriptor];
    if (file.stdout) {
      // @ts-ignore
      process.stdout.write("\n");
      return;
    }

    // @ts-ignore
    writeSync(file.descriptor, "\n");
  },

  enterFunction: function (
    /** @type {string | number} */ x,
    /** @type {any} */ stack,
  ) {
    callstack.push(program.traces[x]);
    stackstack.push(stack);
    //console.log("enter",program.traces[x]);
  },

  // @ts-ignore
  leaveFunction: function (/** @type {any} */ x, /** @type {any} */ stack) {
    callstack.pop();
    var old = stackstack.pop();
    if (old != stack) {
      console.log("stack=", stack, "versus", old);
    }
    //console.log("leave",program.traces[x]);
  },
};

var inputBuffer = "\nplain\n\\input sample\n";
//var inputBuffer = "\n&plain\n\\input sample\n";
//var inputBuffer = "\nplain\n\\dump";
//var inputBuffer = "\nplain";
//var inputBuffer = "\n&plain";

// @ts-ignore
var filesystemLibrary = {
  reset: function (
    /** @type {number | undefined} */ length,
    /** @type {number | undefined} */ pointer,
  ) {
    var buffer = new Uint8Array(memory.buffer, pointer, length);
    // @ts-ignore
    var filename = String.fromCharCode.apply(null, buffer);

    //console.log( filename );

    filename = filename.replace(/ +$/g, "");
    filename = filename.replace(/^TeXfonts:/, "fonts/");

    if (filename == "TeXformats:TEX.POOL") {
      filename = "tex.pool";
    }

    if (filename == "TTY:") {
      files.push({ filename: "stdin", stdin: true, position: 0 });
      return files.length - 1;
    }

    files.push({
      filename: filename,
      position: 0,
      descriptor: openSync(filename, "r"),
    });

    return files.length - 1;
  },

  rewrite: function (
    /** @type {number | undefined} */ length,
    /** @type {number | undefined} */ pointer,
  ) {
    var buffer = new Uint8Array(memory.buffer, pointer, length);
    // @ts-ignore
    var filename = String.fromCharCode.apply(null, buffer);

    filename = filename.replace(/ +$/g, "");

    if (filename == "TTY:") {
      files.push({ filename: "stdout", stdout: true });
      return files.length - 1;
    }

    files.push({
      filename: filename,
      position: 0,
      descriptor: openSync(filename, "w"),
    });

    return files.length - 1;
  },

  close: function (/** @type {string | number} */ descriptor) {
    // @ts-ignore
    var file = files[descriptor];

    if (file.descriptor) {
      closeSync(file.descriptor);
    }

    // @ts-ignore
    files[descriptor] = {};
  },

  eof: function (/** @type {string | number} */ descriptor) {
    // @ts-ignore
    var file = files[descriptor];

    if (file.eof) {
      return 1;
    } else {
      return 0;
    }
  },

  eoln: function (/** @type {string | number} */ descriptor) {
    // @ts-ignore
    var file = files[descriptor];

    if (file.eoln) {
      return 1;
    } else {
      return 0;
    }
  },

  get: function (
    /** @type {string | number} */ descriptor,
    /** @type {number} */ pointer,
    /** @type {number} */ length,
  ) {
    // @ts-ignore
    var file = files[descriptor];

    var buffer = new Uint8Array(memory.buffer);

    if (file.stdin) {
      if (file.position >= inputBuffer.length) {
        buffer[pointer] = 13;
      } else {
        buffer[pointer] = inputBuffer[file.position].charCodeAt(0);
      }
    } else {
      if (
        readSync(file.descriptor, buffer, pointer, length, file.position) == 0
      ) {
        buffer[pointer] = 0;
        file.eof = true;
        file.eoln = true;
        return;
      }
    }

    file.eoln = false;
    if (buffer[pointer] == 10) {
      file.eoln = true;
    }
    if (buffer[pointer] == 13) {
      file.eoln = true;
    }

    file.position = file.position + length;
  },

  put: function (
    /** @type {string | number} */ descriptor,
    /** @type {number | null | undefined} */ pointer,
    /** @type {number | null | undefined} */ length,
  ) {
    var file = files[descriptor];

    var buffer = new Uint8Array(memory.buffer);

    writeSync(file.descriptor, buffer, pointer, length);
  },
};

// Compile the binary and create an instance
try {
} catch (e) {
  console.log(e);
  console.log(callstack);
}
//console.log("exports: " + Object.keys(wasm.exports).sort().join(","));
//console.log();

// Call the code!
//console.log( wasm.exports );
//console.log('an addition: ' + wasm.exports.adder(40, 2));

//var header = fs.readFileSync("header.js").toString();
//fs.writeFileSync( "tex.js", header + program.generate() );
