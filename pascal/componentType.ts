import ArrayType from "./array-type.js";
import FileType from "./file-type.js";
import Identifier from "./identifier.js";
import PointerType from "./pointer-type.js";
import RecordType from "./record-type.js";
import SubrangeType from "./subrange-type.js";

export type ComponentType = ArrayType|RecordType|FileType|PointerType|SubrangeType|Identifier