
import { readFileSync } from 'fs';
import library, { setMemory, setTexPool, setInput } from './library';

var binary = readFileSync('trip-async.wasm');

var code = new WebAssembly.Module(binary);

var pages = 2500;
var memory = new WebAssembly.Memory({initial: pages, maximum: pages});
setMemory(memory.buffer);
setTexPool('trip.pool');

var stdinBuffer = readFileSync(0).toString(); // STDIN_FILENO = 0
setInput(stdinBuffer,
                 function() {
                 });

var wasm = new WebAssembly.Instance(code, { library: library,
                                            env: { memory: memory } } );
wasm.exports.main();
