import * as library from "./library.js";
const { setInput, setMemory } = library;

const binary = await Deno.readFile("tex-async.wasm");

const code = new WebAssembly.Module(binary);

const pages = 2500;
const memory = new WebAssembly.Memory({ initial: pages, maximum: pages });

const buffer = new Uint8Array(memory.buffer);
const f = await Deno.open("core.dump", { read: true });
if ((await f.read(buffer)) !== pages * 65536) {
  throw "Could not load memory dump";
}

setMemory(memory.buffer);

const filename = Deno.args[2];

const data = await Deno.readFile(filename);
setInput(data, () => {
  Deno.exit();
});
setInput(data);

const wasm = new WebAssembly.Instance(code, {
  library: library,
  env: { memory: memory },
});

const exports = wasm.exports as { main(): void };
exports.main();
