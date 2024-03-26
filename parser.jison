%token array begin case const do downto else end file for function goto if label of procedure program record repeat then to type until var while  others r_num i_num string_literal single_char assign define field forward packed identifier true false

%nonassoc '=' '<>' '<' '>' '<=' '>='
%left '+' '-' or
%right unary_plus unary_minus
%left '*' '/' div mod and
%right not

%start PROGRAM

/* Deal with dangling else */
%right "then" "else"

%{

import Program from './pascal/program.js';
import Block from './pascal/block.js';
import ConstantDeclaration from './pascal/constant-declaration.js';
import TypeDeclaration from './pascal/type-declaration.js';
import VariableDeclaration from './pascal/variable-declaration.js';
import RecordDeclaration from './pascal/record-declaration.js';
import VariantDeclaration from './pascal/variant-declaration.js';

import Pointer from './pascal/pointer.js';
import Desig from './pascal/desig.js';
import SubrangeType from './pascal/subrange-type.js';
import PointerType from './pascal/pointer-type.js';
import ArrayType from './pascal/array-type.js';
import RecordType from './pascal/record-type.js';
import FileType from './pascal/file-type.js';
import ArrayIndex from './pascal/array-index.js';
import FunctionDeclaration from './pascal/function-declaration.js';
import Operation from './pascal/operation.js';
import UnaryOperation from './pascal/unary-operation.js';
import StringLiteral from './pascal/string-literal.js';
import NumericLiteral from './pascal/numeric-literal.js';
import SingleCharacter from './pascal/single-character.js';
import FunctionEvaluation from './pascal/function-evaluation.js';
import ExpressionWithWidth from './pascal/expression-with-width.js';

import LabeledStatement from './pascal/statements/labeled-statement.js';
import Nop from './pascal/statements/nop.js';
import Assignment from './pascal/statements/assignment.js';
import Goto from './pascal/statements/goto.js';
import Conditional from './pascal/statements/conditional.js';
import Switch from './pascal/statements/switch.js';
import Case from './pascal/statements/case.js';
import While from './pascal/statements/while.js';
import Repeat from './pascal/statements/repeat.js';
import For from './pascal/statements/for.js';
import CallProcedure from './pascal/statements/call-procedure.js';
import Compound from './pascal/statements/compound.js';

import Identifier from './pascal/identifier.js';

%}

%%

PROGRAM:
        PROGRAM_HEAD
  	LABEL_DEC_PART CONST_DEC_PART TYPE_DEC_PART
  	VAR_DEC_PART
  	P_F_DEC_PART
        BODY
        { return new Program($2,$3,$4,$5,$6, new Compound($7)); }
          ;

P_F_DEC_PART: { $$ = []; }
	| P_F_DEC_PART P_F_DEC  { $$ = $1.concat( [$2] ); }
	;

P_F_DEC:
    procedure IDENTIFIER PARAM ';' BLOCK ';' { $$ = new FunctionDeclaration( $2, $3, undefined, $5 ); }
  | function IDENTIFIER PARAM ':' TYPE ';' BLOCK ';' { $$ = new FunctionDeclaration( $2, $3, $5, $7 ); }
;

/* program statement.  Ignore any files.  */
PROGRAM_HEAD: program identifier PROGRAM_FILE_PART ';'
;

PROGRAM_FILE_PART:
    '(' PROGRAM_FILE_LIST ')'
  | /* empty */
;

PROGRAM_FILE_LIST:
    PROGRAM_FILE
  | PROGRAM_FILE_LIST ',' PROGRAM_FILE
;

PROGRAM_FILE: identifier /* input and output are constants */
;

BLOCK:
    forward { $$ = null; }
  | LABEL_DEC_PART
    CONST_DEC_PART TYPE_DEC_PART
    VAR_DEC_PART
    COMPOUND_STAT
    { $$ = new Block($1,$2,$3,$4,new Compound($5)); }
;

LABEL_DEC_PART:
    /* empty */  { $$ = []; }
  |	label LABEL_LIST ';'   { $$ = $2; }
;

LABEL_LIST:
    LABEL  { $$ = [$1]; }
  | LABEL_LIST ',' LABEL  { $$ = $1.concat( $3 ); }
;

LABEL: INTEGER { $$ = $1; }
;

CONST_DEC_PART:
        /* empty */ { $$ = []; }
      |	const CONST_DEC_LIST { $$ = $2; }
;

CONST_DEC_LIST:
        CONST_DEC { $$ = [$1]; }
      | CONST_DEC_LIST CONST_DEC  { $$ = $1.concat( $2 ); }
;

CONST_DEC: IDENTIFIER '=' CONSTANT_EXPRESS ';'  { $$ = new ConstantDeclaration( $1, $3 ); }
;

CONSTANT:
    INTEGER  { $$ = new NumericLiteral($1, new Identifier("integer")); }
  | r_num  { $$ = new NumericLiteral(parseFloat( yytext ), new Identifier("real")); }
  | true  { $$ = new NumericLiteral(1, new Identifier("boolean")); }
  | false  { $$ = new NumericLiteral(0, new Identifier("boolean")); }
  | STRING     { $$ = $1; }
;

 CONSTANT_EXPRESS:
 	  UNARY_OP CONSTANT_EXPRESS %prec '*'
             { $$ = new UnaryOperation($1, $2);}
         | CONSTANT_EXPRESS '+'
           CONSTANT_EXPRESS              { $$ = new Operation('+', $1, $3);}
         | CONSTANT_EXPRESS '-'
           CONSTANT_EXPRESS              { $$ = new Operation('-', $1, $3);}
         | CONSTANT_EXPRESS '*'
           CONSTANT_EXPRESS              {$$ = new Operation('*', $1, $3); }
         | CONSTANT_EXPRESS div
           CONSTANT_EXPRESS              { $$ = new Operation('div', $1, $3);}
         | CONSTANT_EXPRESS '='
           CONSTANT_EXPRESS              { $$ = new Operation('==', $1, $3);}
         | CONSTANT_EXPRESS '<>'
           CONSTANT_EXPRESS              {$$ = new Operation('!=', $1, $3); }
         | CONSTANT_EXPRESS mod
           CONSTANT_EXPRESS              { $$ = new Operation('%', $1, $3);}
         | CONSTANT_EXPRESS '<'
           CONSTANT_EXPRESS              { $$ = new Operation('<', $1, $3);}
         | CONSTANT_EXPRESS '>'
           CONSTANT_EXPRESS              { $$ = new Operation('>', $1, $3);}
         | CONSTANT_EXPRESS '<='
           CONSTANT_EXPRESS              {$$ = new Operation('<=', $1, $3); }
         | CONSTANT_EXPRESS '>='
           CONSTANT_EXPRESS              {$$ = new Operation('>=', $1, $3); }
         | CONSTANT_EXPRESS and
           CONSTANT_EXPRESS              {$$ = new Operation('&&', $1, $3); }
         | CONSTANT_EXPRESS or
CONSTANT_EXPRESS              { $$ = new Operation('||', $1, $3);}
         | CONSTANT_EXPRESS '/'
CONSTANT_EXPRESS              {$$ = new Operation('/', $1, $3);}
         | CONST_FACTOR { $$ = $1; }
         ;

 CONST_FACTOR:
 	  '('
           CONSTANT_EXPRESS ')'  { $$ = $2; }
  | CONSTANT   { $$ = $1; }
  | IDENTIFIER { $$ = $1; }
         ;

 STRING:  string_literal   { $$ = new StringLiteral(yytext); }
 	| single_char      { $$ = new SingleCharacter(yytext.replace(/^'/,'').replace(/'$/,'').replace(/''/,"'")); }
 	;

 TYPE_DEC_PART:		/* empty */ { $$ = []; }
 		| type TYPE_DEF_LIST { $$ = $2; }
 		;

 TYPE_DEF_LIST:		TYPE_DEF  { $$ = [$1]; }
 		| TYPE_DEF_LIST TYPE_DEF { $$ = $1.concat( $2 ); }
 		;

 TYPE_DEF:
         IDENTIFIER
         '='
         TYPE ';' { $$ = new TypeDeclaration( $1, $3 ); }
 	;

TYPE:
    ARRAY_TYPE  { $$ = $1; }
  | RECORD_TYPE { $$ = $1; }
  | FILE_TYPE { $$ = $1; }
  | POINTER_TYPE { $$ = $1; }
  | SUBRANGE_TYPE { $$ = $1; }
  | IDENTIFIER { $$ = $1; }
;

SUBRANGE_TYPE:
    SUBRANGE_CONSTANT '..' SUBRANGE_CONSTANT { $$ = new SubrangeType($1,$3); }
  | IDENTIFIER '..' SUBRANGE_CONSTANT  { $$ = new SubrangeType($1,$3); }
  | IDENTIFIER '..' IDENTIFIER  { $$ = new SubrangeType($1,$3); }
  | SUBRANGE_CONSTANT '..' IDENTIFIER { $$ = new SubrangeType($1,$3); }
;

INTEGER: i_num { $$ = parseInt(yytext); } ;

SUBRANGE_CONSTANT:
    INTEGER { $$ = new NumericLiteral($1, new Identifier("integer")); }
  | unary_plus INTEGER { $$ = new NumericLiteral($2, new Identifier("integer")); }
  | unary_minus INTEGER { $$ = new NumericLiteral(-$2, new Identifier("integer")); }
  | unary_plus IDENTIFIER { $$ = $2; }
  | unary_minus IDENTIFIER { $$ = new UnaryOperation( '-', $2 ); }
;

 POINTER_TYPE:
 	'^' IDENTIFIER   { $$ = new PointerType( $2 ); }
 	;

 ARRAY_TYPE:
    array '[' INDEX_TYPE ']' of COMPONENT_TYPE  { $$ = new ArrayType( $3, $6, false ); }
  | packed array '[' INDEX_TYPE ']' of COMPONENT_TYPE  { $$ = new ArrayType( $4, $7, true ); }
;

 INDEX_TYPE:
 	  SUBRANGE_TYPE { $$ = $1; }
         | IDENTIFIER       { $$ = $1; }
         ;

 COMPONENT_TYPE: TYPE { $$= $1; };

RECORD_TYPE:
    packed record FIELD_LIST end  { $$ = new RecordType( $3, true ); }
  | record FIELD_LIST end  { $$ = new RecordType( $2, false ); }
;

FIELD_LIST:
  RECORD_SECTION  { if ($1) { $$ = [$1]; } else { $$ = []; } }
| FIELD_LIST ';' RECORD_SECTION  { if ($3) { $$ = $1.concat( $3 ); } else { $$ = $1; } }
;

RECORD_SECTION:  FIELD_ID_LIST ':' TYPE { $$ = new RecordDeclaration( $1, $3 ); }
  | case identifier of RECORD_CASES { $$ = new VariantDeclaration( $4 ); }
  | /* empty */ { $$ = undefined; }
;

RECORD_CASES:
RECORD_CASE { $$ = [new RecordType($1)]; }
  | RECORD_CASES RECORD_CASE { $$ = $1.concat( [new RecordType($2)] ); }
;

RECORD_CASE: i_num ':' '(' FIELD_LIST ')' ';' { $$ = $4; } ;

FIELD_ID_LIST:
    IDENTIFIER { $$ = [$1]; }
  | FIELD_ID_LIST ',' IDENTIFIER  { $$ = $1.concat( $3 ); }
;

IDENTIFIER: identifier { $$ = new Identifier(yytext); }
;

FILE_TYPE: file of TYPE {  $$ = new FileType( $3, false ); }
  | packed file of TYPE {  $$ = new FileType( $4, true ); }
;

VAR_DEC_PART:
    /* empty */ { $$ = []; }
  | var VAR_DEC_LIST  { $$ = $2; }
;

 VAR_DEC_LIST:
 	  VAR_DEC   { $$ = [$1]; }
 	| VAR_DEC_LIST VAR_DEC  { $$ = $1.concat( [$2] ); }
 	;

VAR_DEC: VAR_ID_DEC_LIST ':' TYPE ';' {  $$ = new VariableDeclaration( $1, $3 ); }
;

VAR_ID_DEC_LIST:	IDENTIFIER    { $$ = [$1]; }
    | VAR_ID_DEC_LIST ',' IDENTIFIER  { $$ = $1.concat( [$3] ); }
;

BODY:
	  /* empty */ { $$ = []; }
	| begin
	  STAT_LIST end '.' { $$ = $2; }
	;

PARAM:  { $$ = []; } |
	'('
	  FORM_PAR_SEC_L ')'
	{ $$ = $2; } ;

FORM_PAR_SEC_L:		FORM_PAR_SEC  { $$ = [$1]; }
		| FORM_PAR_SEC_L ';' FORM_PAR_SEC  { $$ = $1.concat( [$3] ); }
		;

FORM_PAR_SEC1:  VAR_ID_DEC_LIST ':' IDENTIFIER  {  $$ = new VariableDeclaration( $1, $3 ); }
	;

FORM_PAR_SEC:
    FORM_PAR_SEC1 { $$ = $1; }
  | var FORM_PAR_SEC1  { $2.reference = true; $$ = $2; }
;

COMPOUND_STAT: begin STAT_LIST end  { $$ = $2; }
;

STAT_LIST:
    STATEMENT  { $$ = [$1]; }
  | STAT_LIST ';' STATEMENT  { $$ = $1.concat( [$3] ); }
;

STATEMENT:
    UNLAB_STAT { $$ = $1; }
  | INTEGER ':' UNLAB_STAT { $$ = new LabeledStatement( $1, $3 ); }
;

UNLAB_STAT:	  SIMPLE_STAT { $$ = $1; }
		| STRUCT_STAT  { $$ = $1; }
		;

SIMPLE_STAT:	  VARIABLE assign EXPRESS  { $$ = new Assignment( $1, $3 ); }
		| PROC_STAT { $$ = $1; }
		| goto INTEGER  { $$ = new Goto( $2 ); }
		| /* empty */  { $$ = new Nop(); }
;

VARIABLE:
    IDENTIFIER { $$ = $1; }
  | VARIABLE '[' EXPRESS ']' { $$ = new Desig( $1, new ArrayIndex($3) ); }
  | VARIABLE '.' IDENTIFIER { $$ = new Desig( $1, $3 ); }
  | VARIABLE '^' { $$ = new Pointer($1); }
;

EXPRESS:
    UNARY_OP EXPRESS	%prec '*' { $$ = new UnaryOperation( $1, $2 ); }
  | EXPRESS '+'  EXPRESS { $$ = new Operation( '+', $1, $3 ); }
  | EXPRESS '-'  EXPRESS { $$ = new Operation( '-', $1, $3 ); }
  | EXPRESS '*' EXPRESS { $$ = new Operation( '*', $1, $3 ); }
  | EXPRESS div EXPRESS { $$ = new Operation( 'div', $1, $3 ); }
  | EXPRESS '='  EXPRESS { $$ = new Operation( '==', $1, $3 ); }
  | EXPRESS '<>' EXPRESS { $$ = new Operation( '!=', $1, $3 ); }
  | EXPRESS mod  EXPRESS { $$ = new Operation( '%', $1, $3 ); }
  | EXPRESS '<'  EXPRESS { $$ = new Operation( '<', $1, $3 ); }
  | EXPRESS '>'  EXPRESS { $$ = new Operation( '>', $1, $3 ); }
  | EXPRESS '<=' EXPRESS { $$ = new Operation( '<=', $1, $3 ); }
  | EXPRESS '>='  EXPRESS { $$ = new Operation( '>=', $1, $3 ); }
  | EXPRESS and  EXPRESS { $$ = new Operation( '&&', $1, $3 ); }
  | EXPRESS or  EXPRESS { $$ = new Operation( '||', $1, $3 ); }
  | EXPRESS '/' EXPRESS { $$ = new Operation( '/', $1, $3 ); }
  | FACTOR { $$ = $1; }
;

UNARY_OP:
    unary_plus { $$ = "+"; }
  | unary_minus { $$ = "-"; }
  | not  { $$ = "!"; }
;

FACTOR:
    '(' EXPRESS ')' { $$ = $2; }
  | VARIABLE { $$ = $1; }
  | CONSTANT { $$ = $1; }
  | IDENTIFIER PARAM_LIST  { $$ = new FunctionEvaluation($1, $2 ); }
;

PARAM_LIST: '(' ACTUAL_PARAM_L ')' { $$ = $2; }
;

ACTUAL_PARAM_L:
    ACTUAL_PARAM  { $$ = [$1]; }
  | ACTUAL_PARAM_L ',' ACTUAL_PARAM   { $$ = $1.concat( [$3] ); }
;

ACTUAL_PARAM:
EXPRESS WIDTH_FIELD  { if ($2 === undefined) { $$ = $1; } else { $$ = new ExpressionWithWidth( $1, $2 ); } }
// FIXME: WHY IS THIS HERE?
//	| TYPE_ID   { $$ = $1; }
	;

WIDTH_FIELD:
    ':' INTEGER { $$ = $2; }
  | /* empty */ { $$ = undefined; }
;

/* "variable" here really means "identifier" */
PROC_STAT:
    VARIABLE { $$ = new CallProcedure( $1, [] ); }
  | VARIABLE '(' ')' { $$ = new CallProcedure( $1, [] ); }
  | VARIABLE PARAM_LIST  { $$ = new CallProcedure( $1, $2 ); }
;

STRUCT_STAT:
    COMPOUND_STAT { $$ = new Compound($1); }
  | IF_STATEMENT { $$ = $1; }
  | CASE_STATEMENT { $$ = $1; }
  | WHILE_STATEMENT { $$ = $1; }
  | REP_STATEMENT { $$ = $1; }
  | FOR_STATEMENT { $$ = $1; }
;

IF_STATEMENT:	if EXPRESS then STATEMENT %prec "then"  { $$ = new Conditional($2, $4, undefined); }
| if EXPRESS then STATEMENT else STATEMENT %prec "else"  { $$ = new Conditional($2, $4, $6); }
;

CASE_STATEMENT:	case EXPRESS of CASE_EL_LIST END_CASE { $$ = new Switch( $2, $4 ); }
;

CASE_EL_LIST:
    CASE_ELEMENT       { $$ = [$1]; }
  | CASE_EL_LIST ';' CASE_ELEMENT  { $$ = $1.concat( [$3] ); }
;

CASE_ELEMENT: CASE_LAB_LIST ':' UNLAB_STAT { $$ = new Case($1,$3); }
;

CASE_LAB_LIST:
    CASE_LAB      { $$ = [$1]; }
  | CASE_LAB_LIST ',' CASE_LAB  { $$ = $1.concat([$3]); }
;

CASE_LAB:
    INTEGER      { $$ = $1; }
  | others  { $$ = true; }
;

END_CASE:
    end
  | ';' end
;

WHILE_STATEMENT: while EXPRESS do STATEMENT { $$ = new While( $2, $4 ); }
;

REP_STATEMENT: repeat STAT_LIST until EXPRESS { $$ = new Repeat( $4, new Compound($2) ); }
;

FOR_STATEMENT: for IDENTIFIER assign FOR_LIST do STATEMENT  { $$ = new For( $2, $4[0], $4[1], $4[2], $6 ); }
;

FOR_LIST:
    EXPRESS to EXPRESS  { $$ = [$1,$3,1]; }
  | EXPRESS downto EXPRESS   { $$ = [$1,$3,-1]; }
;
