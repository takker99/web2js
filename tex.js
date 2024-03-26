import { readFileSync, openSync, readSync, readFile } from 'fs';
import * as library from './library.js';
const { setInput, setMemory } = library

var binary = readFileSync('tex-async.wasm');

var code = new WebAssembly.Module(binary);

var pages = 2500;
var memory = new WebAssembly.Memory({initial: pages, maximum: pages});

var buffer = new Uint8Array( memory.buffer );
var f = openSync('core.dump','r');
if (readSync( f, buffer, 0, pages*65536 ) != pages*65536)
  throw 'Could not load memory dump';

setMemory(memory.buffer);

let filename = process.argv[2];

readFile(filename, 'utf8', function(err, data) {
  if (err) throw err;
  setInput(data,
                   function() {
                     process.exit();
                   });
  setInput(data);

  var wasm = new WebAssembly.Instance(code, { library: library,
                                              env: { memory: memory } } );

  wasm.exports.main();
});
