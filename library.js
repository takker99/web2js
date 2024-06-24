import {
  close as _close,
  openSync,
  readFileSync,
  statSync,
  write,
  writeFileSync,
  writeSync,
} from "node:fs";
import { stdin as _stdin, stdout as _stdout } from "node:process";
import { execSync as exec } from "node:child_process";
import { createInterface } from "node:readline";
/**
 * @type {{ filename: string; stdin?: boolean; position?: number; position2?: number; erstat: number; eoln?: boolean; content?: Buffer; descriptor?: number; stdout?: boolean; writing?: boolean; output?: never[]; }[]}
 */
var files = [];


/**
 * @type {Iterable<number> | ArrayBuffer | undefined}
 */
var memory = undefined;
/**
 * @type {string | any[] | ArrayBuffer | { valueOf(): ArrayBuffer | SharedArrayBuffer; } | undefined}
 */
var inputBuffer = undefined;
/**
 * @type {(() => void) | undefined}
 */
var callback = undefined;
var texPool = "tex.pool";

/**
 * @type {{ asyncify_start_unwind: (arg0: number) => void; asyncify_start_rewind: (arg0: number) => void; main: () => void; asyncify_stop_rewind: () => void; }}
 */
let wasmExports;
/**
 * @type {Int32Array | number[]}
 */
let view;


let window = {};

/**
 * @param {Iterable<number>|ArrayBuffer|SharedArrayBuffer} m
 */
export function setMemory(m) {
  memory = m;
  view = new Int32Array(m);
}
/**
 * @param {any} m
 */
export function setWasmExports(m) {
  wasmExports = m;
}
/**
 * @param {string} m
 */
export function setTexPool(m) {
  texPool = m;
}
/**
 * @param {any} input
 * @param {CallableFunction=} cb
 */
export function setInput(input, cb) {
  inputBuffer = input;
  if (cb) callback = cb;
}
export function getCurrentMinutes() {
  var d = new Date();
  return 60 * (d.getHours()) + d.getMinutes();
}
export function getCurrentDay() {
  return (new Date()).getDate();
}
export function getCurrentMonth() {
  return (new Date()).getMonth() + 1;
}
export function getCurrentYear() {
  return (new Date()).getFullYear();
}
/**
 * @param {number} descriptor
 * @param {number | undefined} x
 */
export function printString(descriptor, x) {
  var file = (descriptor < 0) ? { stdout: true } : files[descriptor];
  var length = new Uint8Array(memory, x, 1)[0];
  var buffer = new Uint8Array(memory, x + 1, length);
  var string = String.fromCharCode.apply(null, buffer);

  if (file.stdout) {
    _stdout.write(string, () => { });
    return;
  }

  writeSync(file.descriptor, string);
}
/**
 * @param {number} descriptor
 * @param {any} x
 */
export function printBoolean(descriptor, x) {
  var file = (descriptor < 0) ? { stdout: true } : files[descriptor];

  var result = x ? "TRUE" : "FALSE";

  if (file.stdout) {
    _stdout.write(result);
    return;
  }

  writeSync(file.descriptor, result);
}
/**
 * @param {number} descriptor
 * @param {number} x
 */
export function printChar(descriptor, x) {
  var file = (descriptor < 0) ? { stdout: true } : files[descriptor];
  if (file.stdout) {
    _stdout.write(String.fromCharCode(x));
    return;
  }

  var b = Buffer.alloc(1);
  b[0] = x;
  writeSync(file.descriptor, b);
}
/**
 * @param {number} descriptor
 * @param {{ toString: () => string | NodeJS.ArrayBufferView; }} x
 */
export function printInteger(descriptor, x) {
  var file = (descriptor < 0) ? { stdout: true } : files[descriptor];
  if (file.stdout) {
    _stdout.write(x.toString());
    return;
  }

  writeSync(file.descriptor, x.toString());
}
/**
 * @param {number} descriptor
 * @param {{ toString: () => string | NodeJS.ArrayBufferView; }} x
 */
export function printFloat(descriptor, x) {
  var file = (descriptor < 0) ? { stdout: true } : files[descriptor];
  if (file.stdout) {
    _stdout.write(x.toString());
    return;
  }

  writeSync(file.descriptor, x.toString());
}
/**
 * @param {number} descriptor
 * @param {any} x
 */
export function printNewline(descriptor) {
  var file = (descriptor < 0) ? { stdout: true } : files[descriptor];
  if (file.stdout) {
    _stdout.write("\n");
    return;
  }

  writeSync(file.descriptor, "\n");
}
/**
 * @param {number | undefined} length
 * @param {number | undefined} pointer
 */
export function reset(length, pointer) {
  var buffer = new Uint8Array(memory, pointer, length);
  var filename = String.fromCharCode.apply(null, buffer);

  filename = filename.replace(/\000+$/g, "");

  if (filename.startsWith("{")) {
    filename = filename.replace(/^{/g, "");
    filename = filename.replace(/}.*/g, "");
  }

  if (filename.startsWith('"')) {
    filename = filename.replace(/^"/g, "");
    filename = filename.replace(/".*/g, "");
  }

  filename = filename.replace(/ +$/g, "");
  filename = filename.replace(/^\*/, "");

  filename = filename.replace(/^TeXfonts:/, "");

  if (filename == "TeXformats:TEX.POOL") {
    filename = texPool;
  }

  if (filename == "TTY:") {
    files.push({
      filename: "stdin",
      stdin: true,
      position: 0,
      position2: 0,
      erstat: 0,
      eoln: false,
      content: Buffer.from(inputBuffer),
    });
    return files.length - 1;
  }

  try {
    var path = exec("kpsewhich " + filename).toString().split("\n")[0];
  } catch (e) {
    // try again with basename
    let basename = filename.slice(filename.lastIndexOf("/") + 1);
    try {
      var path = exec("kpsewhich " + basename).toString().split("\n")[0];
      console.log(`Found filename #${filename}# via basename at #${path}#`);
    } catch (e) {
      // Give up, just create empty file
      exec("touch " + basename);
      path = basename;
      console.log(`For filename #${filename}# created empty #${basename}#`);
    }
  }

  files.push({
    filename: filename,
    position: 0,
    position2: 0,
    erstat: 0,
    eoln: false,
    descriptor: openSync(path, "r"),
    content: readFileSync(path),
  });

  return files.length - 1;
}
/**
 * @param {number | undefined} length
 * @param {number | undefined} pointer
 */
export function rewrite(length, pointer) {
  var buffer = new Uint8Array(memory, pointer, length);
  var filename = String.fromCharCode.apply(null, buffer);
  filename = filename.replace(/ +$/g, "");

  if (filename == "TTY:") {
    files.push({
      filename: "stdout",
      stdout: true,
      erstat: 0,
    });
    return files.length - 1;
  }

  files.push({
    filename: filename,
    position: 0,
    writing: true,
    erstat: 0,
    output: [],
    descriptor: openSync(filename, "w"),
  });

  return files.length - 1;
}
/**
 * @param {number | undefined} length
 * @param {number | undefined} pointer
 */
export function getfilesize(length, pointer) {
  var buffer = new Uint8Array(memory, pointer, length);
  var filename = String.fromCharCode.apply(null, buffer);

  if (filename.startsWith("{")) {
    filename = filename.replace(/^{/g, "");
    filename = filename.replace(/}.*/g, "");
  }

  filename = filename.replace(/ +$/g, "");
  filename = filename.replace(/^\*/, "");
  filename = filename.replace(/^TeXfonts:/, "");

  if (filename == "TeXformats:TEX.POOL") {
    filename = "tex.pool";
  }

  try {
    filename = exec("kpsewhich " + filename).toString().split("\n")[0];
  } catch (e) {
    try {
      var stats = statSync(filename);

      return stats.size;
    } catch (e) {
      return 0;
    }
  }

  return 0;
}
/**
 * @param {string | number} descriptor
 */
export function close(descriptor) {
  var file = files[descriptor];

  if (file.descriptor) {
    if (file.writing) {
      write(file.descriptor, Buffer.concat(file.output), () => { });
    }
    _close(file.descriptor, () => { });
  }

  files[descriptor] = {};
}
/**
 * @param {string | number} descriptor
 */
export function eof(descriptor) {
  var file = files[descriptor];

  if (file.eof) {
    return 1;
  } else {
    return 0;
  }
}
/**
 * @param {string | number} descriptor
 */
export function erstat(descriptor) {
  var file = files[descriptor];
  return file.erstat;
}
/**
 * @param {string | number} descriptor
 */
export function eoln(descriptor) {
  var file = files[descriptor];

  if (file.eoln) {
    return 1;
  } else {
    return 0;
  }
}
/**
 * @param {number} str_number
 * @param {number | undefined} str_poolp
 * @param {number | undefined} str_startp
 * @param {number | undefined} pool_ptrp
 * @param {number} pool_size
 * @param {number} max_strings
 * @param {number} eqtbp
 * @param {number} active_base
 * @param {any} eqtb_size
 * @param {number} count_base
 */
export function evaljs(
  str_number,
  str_poolp,
  str_startp,
  pool_ptrp,
  pool_size,
  max_strings,
  eqtbp,
  active_base,
  count_base,
) {
  var str_start = new Uint32Array(memory, str_startp, max_strings + 1);
  var pool_ptr = new Uint32Array(memory, pool_ptrp, 1);
  var str_pool = new Uint8Array(memory, str_poolp, pool_size + 1);
  var length = str_start[str_number + 1] - str_start[str_number];
  var input = new Uint8Array(memory, str_poolp + str_start[str_number], length);
  var string = new TextDecoder("ascii").decode(input);

  var count = new Uint32Array(
    memory,
    eqtbp + 8 * (count_base - active_base),
    512,
  );

  const handler = {
    get: function (/** @type {any[]} */ target, /** @type {number} */ prop) {
      return target[2 * prop];
    },
    set: function (
      /** @type {any[]} */ target,
      /** @type {number} */ prop,
      /** @type {any} */ value,
    ) {
      target[2 * prop] = value;
    },
  };

  var tex = {
    print: function (/** @type {string | undefined} */ s) {
      const encoder = new TextEncoder("ascii");
      const view = encoder.encode(s);
      const b = Buffer.from(view);
      str_pool.set(b, pool_ptr[0]);
      pool_ptr[0] += view.length;
    },
    count: new Proxy(count, handler),
  };

  var f = Function(["tex", "window"], string);
  f(tex, window);
}
/**
 * @param {string | number} descriptor
 * @param {any} bypass_eoln
 * @param {number | undefined} bufferp
 * @param {number | undefined} firstp
 * @param {number | undefined} lastp
 * @param {number | undefined} max_buf_stackp
 * @param {number | undefined} buf_size
 */
export function inputln(
  descriptor,
  bypass_eoln,
  bufferp,
  firstp,
  lastp,
  buf_size,
) {
  var file = files[descriptor];

  var buffer = new Uint8Array(memory, bufferp, buf_size);
  var first = new Uint32Array(memory, firstp, 1);
  var last = new Uint32Array(memory, lastp, 1);
  // FIXME: this should not be ignored

  // cf.\ Matthew 19\thinspace:\thinspace30
  last[0] = first[0];

  // input the first character of the line into |f^|
  if (bypass_eoln) {
    if (!file.eof) {
      if (file.eoln) {
        file.position2 = file.position2 + 1;
      }
    }
  }

  let endOfLine = file.content.indexOf(10, file.position2);
  if (endOfLine < 0) endOfLine = file.content.length;

  if (file.position2 >= file.content.length) {
    if (file.stdin) {
      if (callback) callback();
    }

    file.eof = true;
    return false;
  } else {
    var bytesCopied = file.content.copy(
      buffer,
      first[0],
      file.position2,
      endOfLine,
    );

    last[0] = first[0] + bytesCopied;

    while (buffer[last[0] - 1] == 32) {
      last[0] = last[0] - 1;
    }

    file.position2 = endOfLine;
    file.eoln = true;
  }

  return true;
}
/**
 * @param {string | number} descriptor
 * @param {string | number} pointer
 * @param {any} length
 */
export function get(descriptor, pointer, length) {
  var file = files[descriptor];

  var buffer = new Uint8Array(memory);

  if (file.stdin) {
    if (file.position >= inputBuffer.length) {
      buffer[pointer] = 13;
      if (callback) callback();
    } else {
      buffer[pointer] = inputBuffer[file.position].charCodeAt(0);
    }
  } else {
    if (file.descriptor) {
      let endOfCopy = Math.min(file.position + length, file.content.length);

      var bytesCopied = file.content.copy(
        buffer,
        pointer,
        file.position,
        endOfCopy,
      );

      if (bytesCopied == 0) {
        buffer[pointer] = 0;
        file.eof = true;
        file.eoln = true;
        return;
      }
    } else {
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
}
/**
 * @param {string | number} descriptor
 * @param {number | undefined} pointer
 * @param {number | undefined} length
 */
export function put(descriptor, pointer, length) {
  var file = files[descriptor];
  var buffer = new Uint8Array(memory, pointer, length);

  if (file.writing) {
    file.output.push(Buffer.from(buffer));
  }
}
export function snapshot() {
  console.log("(-snapshot-)");
  writeFileSync("files.json", JSON.stringify(files));
  return 1;
}
