import {
  all,
  ok,
  choice,
  lazy,
  Parser,
} from "../deps/bread-n-butter.ts";
import { separator } from "./separator.ts";
import { token, identifier, eos, comma, lParen, rParen, nothing, colon, semicolon ,constant, real, integer, literal, minus, plus} from "./token.ts";
import { programHeading } from "./programHeading.ts";
import { label, labelDeclarationPart } from "./labelDeclarationPart.ts";
import { constDeclarationPart } from "./constDeclarationPart.ts";
import { subrangeType } from "./subrangeType.ts";
import { enumeratedType } from "./enumeratedType.ts";

const pascalTrue = token("true").map(() => true);
const pascalFalse = token("false").map(() => false);


const constantExpression: Parser<string | number | boolean> = lazy(() =>
  choice(
    constantExpression.skip(token("+")).and(constantExpression).map(([a, b]) =>
      a + b
    ),
    constantExpression.skip(token("-")).and(constantExpression).map(([a, b]) =>
      a - b
    ),
    constantExpression.skip(token("*")).and(constantExpression).map(([a, b]) =>
      a * b
    ),
    constantExpression.skip(token("/")).and(constantExpression).map(([a, b]) =>
      a / b
    ),
    constantExpression.skip(token("div")).and(constantExpression).map((
      [a, b],
    ) => Math.floor(a / b)),
    constantExpression.skip(token("mod")).and(constantExpression).map((
      [a, b],
    ) => a % b),
    constantExpression.skip(token("and")).and(constantExpression).map((
      [a, b],
    ) => a & b),
    constantExpression.skip(token("or")).and(constantExpression).map(([a, b]) =>
      a | b
    ),
    constantExpression.skip(token("not")).map((a) => !a),
    constantExpression.skip(token("=")).and(constantExpression).map(([a, b]) =>
      a === b
    ),
    constantExpression.skip(token("<>")).and(constantExpression).map(([a, b]) =>
      a !== b
    ),
    constantExpression.skip(token("<")).and(constantExpression).map(([a, b]) =>
      a < b
    ),
    constantExpression.skip(token("<=")).and(constantExpression).map(([a, b]) =>
      a <= b
    ),
    constantExpression.skip(token(">")).and(constantExpression).map(([a, b]) =>
      a > b
    ),
    constantExpression.skip(token(">=")).and(constantExpression).map(([a, b]) =>
      a >= b
    ),
    constantExpression.wrap(lParen, rParen),
    constant,
    identifier,
  )
);



const ordinalType = choice(
  token("Boolean"),
  token("Integer"),
  token("Char"),
  enumeratedType,
  subrangeType,
);

const SimpleType = choice(
  ordinalType,
  token("Real"),
)

// identifierは型名
const pointerType = token("^").next(identifier).desc(["pointerType"]);

const indexType = subrangeType.or(identifier);
const arrayType = token("array").next(
  indexType.wrap(token("["), token("]"))
).skip(token("of")).and(pascalType);
const setType = token("packed").or(nothing).next(token("set")).next(token("of")).next(ordinalType);
const variantField = lazy(
  ()=> constant.sepBy(comma, 1).skip(colon).and(fieldList.wrap(lParen, rParen))
);
const variantRecord =
  token("case").next(identifier.skip(colon)).or(nothing).and(pascalType).skip(token("of")).and(
    variantField.sepBy(eos, 1),
  ),
);
const fieldDeclaration = identifier.sepBy(comma, 1).skip(colon).and(pascalType);
const fieldList = fieldDeclaration.sepBy(eos).and(variantRecord.or(nothing));


const recordType = token("packed").or(nothing).next(token("record")).next(
  fieldList,
).skip(token("end"));
const fileType = token("packed").or(nothing).next(token("file")).next(
  token("of"),
)
  .next(pascalType);

const structuredType = choice(
  arrayType,
  recordType,
  setType,
  fileType,
)

const pascalType = choice(SimpleType, structuredType, pointerType);

const typeDefinition = identifier.skip(token("=")).and(pascalType)

// https://qiita.com/ht_deko/items/2d5996cbfc82d734b247#34-%E5%9E%8B%E5%AE%9A%E7%BE%A9%E9%83%A8-type-definition-part
const typeDefinitionPart = token("type").next(typeDefinition.sepBy(eos, 1))
  .or(
    ok([] as [string, unknown][]),
  );

const variableDefinitionPart = token("var").next(fieldDeclaration.sepBy(eos, 1)).map(v=>v.flat()).or(ok([]as [string,unknown][]));

const caseLabel = integer.or(token("others"));
const unsignedConstant = choice(
  unsignedNumber,
  literal,
  constantName,
  nil,
);
const functionCalling=lazy(()=>identifier.and(actualParameterList));

const setItem=expression.or(expression.skip(token("..")).and(expression));
const setConstructors=setItem.sepBy(comma,1).wrap(token("["),token("]"));

const factor = lazy(()=>choice(
  unsignedConstant,
  limitName,
  variable,
  setConstructors,
  functionCalling,
  token("not").next(factor),
  expression.wrap(lParen, rParen),
));
const term=factor.or(factor.sepBy(choice(token("*"), token("/"), token("div"), token("mod"), token("and"))));

const simpleExpression = plus.or(minus).or(nothing).and(term)
  .and(plus.or(minus).or(token("in")).and(term).sepBy(separator));

const expression: Parser<string | number | boolean> =
  choice(
    simpleExpression.skip(token("=")).and(simpleExpression).map(([a, b]) => a === b),
    simpleExpression.skip(token("<>")).and(simpleExpression).map(([a, b]) => a !== b),
    simpleExpression.skip(token("<")).and(simpleExpression).map(([a, b]) => a < b),
    simpleExpression.skip(token("<=")).and(simpleExpression).map(([a, b]) => a <= b),
    simpleExpression.skip(token(">")).and(simpleExpression).map(([a, b]) => a > b),
    simpleExpression.skip(token(">=")).and(simpleExpression).map(([a, b]) => a >= b),
    simpleExpression.skip(token("in")).and(simpleExpression).map(([a, b]) => a >= b),
  );

const variable: Parser<unknown> = lazy(() =>
  choice(
    identifier,
    variable.and(expression.wrap(lParen, rParen)),
    variable.skip(token(".")).and(identifier),
    variable.skip(token("^")),
  )
);

const whileStatement = token("while").next(judgeExpression).skip(token("do")).and(statement);
const repeatStatement = token("repeat").next(statement.sepBy(eos,1)).skip(token("until")).and(judgeExpression);
// controlVariableにはordinalTypeが使える
const forStatement = token("for").next(controlVariable).skip(token(":=")).and(initialValue).and(token("to").or(token("downto"))).and(endValue).skip(token("do")).and(statement);

const ifStatement = token("if").next(judgeExpression).skip(token("then")).and(statement).or(token("else").next(statement));
const caseStatement = token("case").next(judgeExpression).skip(token("of")).and(constant.sepBy(comma,1).skip(colon).and(statement).sepBy(eos,1)).skip(token("end"));
const gotoStatement = token("goto").next(label);
const withStatement = token("with").next(identifier.sepBy(comma, 1)).skip(token("do")).and(statement);
const statement:Parser<unknown> = lazy(() => label.skip(colon).or(nothing).and(simpleStatement.or(compoundStatement)));

const compoundStatement = statement.sepBy(eos,1).skip(eos.or(nothing)).wrap(token("begin"), token("end"));

const assignmentStatement = variable.skip(token(":=")).and(expression);
/* "variable" here really means "identifier" */
const procedureStatement = choice(
  variable,
  variable.skip(nothing.wrap(lParen, rParen)),
  variable.and(parameterList),
);
const simpleStatement=choice(
  assignmentStatement,
  procedureStatement,
  whileStatement,
  repeatStatement,
  forStatement,
  ifStatement,
  caseStatement,
  gotoStatement,
  withStatement,
);

const block :Parser<unknown>= lazy(()=>all(
  labelDeclarationPart,
  constDeclarationPart,
  typeDefinitionPart,
  variableDefinitionPart,
  procedureAndFunctionDefinitonPart,
  compoundStatement,
));

const directives = token("forward");

// identifierが型名
const parameter = identifier.sepBy(comma, 1).skip(colon).and(identifier);
const formalParameter = token("var").or(nothing).and(parameter);
const formalParameterList = formalParameter.sepBy(comma, 1).wrap(lParen, rParen);

const actualParameter = expression.or(variable);
const actualParameterList = actualParameter.sepBy(comma).wrap(lParen, rParen);

const procedureHeading=token("procedure").next(identifier).and(formalParameterList).desc(["procedure"]);
// 最後のidentifierは型名
const functionHeading=token("function").next(identifier).and(formalParameterList).skip(colon).and(identifier).desc(["function"]);

const procedureAndFunctionDefinitonPart = procedureHeading.or(functionHeading).skip(semicolon).and(block.or(directives)).skip(eos).sepBy(separator);

const pascal = all(
  programHeading,
  labelDeclarationPart,
  constDeclarationPart,
  typeDefinitionPart,
  variableDefinitionPart,
  procedureAndFunctionDefinitonPart,
  compoundStatement,
).skip(token("."));

if (import.meta.main) {
  const res = await fetch("https://raw.githubusercontent.com/takker99/web2js/typescript/spec/record.p");
  console.log(pascal.tryParse(await res.text()));
}