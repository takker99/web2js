import {
  choice,
  match,
  text,
} from "https://raw.githubusercontent.com/wavebeem/bread-n-butter/v0.6.0/src/bread-n-butter.ts";
import { separator } from "./separator.ts";

export const identifier = match(/\w[\w\d]*/).desc(["identifier"]).trim(separator).desc(["identifier"]);
export const token = <S extends string>(str: S) => text(str).trim(separator);
export const colon = token(":");
export const semicolon = token(";");
export const nothing = text("");
export const comma = token(",");
export const lParen = token("(");
export const rParen = token(")");

/** end of statement */
export const eos = semicolon;

export const integer = match(/[+\-]?(0|[1-9]\d*)/).map(parseInt).trim(separator).desc(["integer"]);
export const real = match(/[+\-]?(0|[1-9]\d*)\.\d+(e[+-]?\d+)?/i).map(parseFloat).trim(
  separator,
).desc(["real"]);

const char = match(/[^']/).or(text("''"));
// char typeの定数
// https://qiita.com/ht_deko/items/ce1f56017fb4fcf0302a#15-%E6%96%87%E5%AD%97%E5%88%97-character-strings
export const character = char.or(nothing).trim(text("'"));

// 文字列型の定数
export const literal = char.repeat().map((chars) => chars.join("")).trim(text("'")).desc(["literal"]);

export const constant = choice(
  integer,
  real,
  // 定数名
  literal,
  identifier,
).desc(["constant"]);

export const plus = token("+");
export const minus = token("-");
