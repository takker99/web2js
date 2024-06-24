import * as library from "./library.js";
const { setInput, setMemory, setTexPool } = library;

const binary = await Deno.readFile("trip-async.wasm");

const code = new WebAssembly.Module(binary);

const pages = 2500;
const memory = new WebAssembly.Memory({ initial: pages, maximum: pages });
setMemory(memory.buffer);
setTexPool("trip.pool");

const stdinBuffer = new Uint8Array(0);
setInput(stdinBuffer, function () {
});

const wasm = new WebAssembly.Instance(code, {
  library: library,
  env: { memory: memory },
});
const exports = wasm.exports as { main(): void };
exports.main();
