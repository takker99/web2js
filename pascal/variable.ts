import Desig from "./desig.js";
import Identifier from "./identifier.js";
import Pointer from "./pointer.js";

export interface Variable {
    name: string;
    offset: number;
    type: any;
    base: number;
    set:(expression:number)=>number|undefined;
    get:()=>number|undefined;
    rebase:(type:unknown,base:number)=>Variable;
    pointer:(value:unknown)=>number;
}

export type VariableType = Identifier|Desig|Pointer