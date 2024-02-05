import Environment from "./environment.js";

export interface Statement {
    gotos(): string[];
    generate(e: Environment): unknown;
}