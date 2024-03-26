declare module "flex-js" {
  export type Action = (lexer: Lexer) => string | undefinned;
  export type Rule = { action?: Action; expression: string | RegExp };
  export class Lexer {
    constructor();

    /** * End of file indicator.  */
    EOF = 0 as const;

    /** * Default initial inclusive state name.  */
    STATE_INITIAL = "INITIAL" as const;

    /** * State name reserved to match with any inclusive/exclusive state.  */
    STATE_ANY = "*" as const;

    /** * Rule indicating EOF.  */
    RULE_EOF = "<<EOF>>" as const;

    text: string;

    private rules: Record<string, Rule[]>;

    /** * Reset lexer state but keep configuration.  */
    reset(): void;

    /** * Reset lexer configuration and internal state.  */
    clear(): void;

    /**
     * Set ignore case mode.
     *
     * By default it is case sensitie.
     *
     * @param  ignoreCase
     */
    setIgnoreCase(ignoreCase: boolean): void;

    /**
     * Set debug enabled.
     *
     * By default it is disabled.
     *
     * @param  debugEnabled
     */
    setDebugEnabled(debugEnabled: boolean): void;

    /**
     * Add additional state
     *
     * @param   name
     * @param  [exclusive]
     */
    addState(name: string, exclusive?: boolean): void;

    /**
     * Add definition.
     *
     * @param  name        Definition name, case sensitive.
     * @param  expression  Expression, can't use flags.
     *
     * @public
     */
    addDefinition(name: string, expression: string | RegExp): void;

    /**
     * Add state-specific rule.
     *
     * Action return value 0 is reserved for TERMINATE action.
     * Action return value undefined is reserved for DISCARD action.
     * Any other value could be used as return value from action as token.
     *
     * @param  states      Single state or state array, case sensitive.
     * @param  expression  Expression, can use flags and definitions.
     * @param  [action]    Default action is DISCARD.
     */
    addStateRule(states: string[] | string, expression: string | RegExp, action?: Action): void;

    /**
     * Add multiple rules into one or more states at once.
     *
     * @param  states      Single state or state array, case sensitive.
     * @param  rules       Each item should have expression and action keys.
     */
    addStateRules(states: string[] | string, rules: Rule[]): void;

    /**
     * Add rule without explicit state.
     *
     * Based on inclusive/exclusive state option it could be available within any state
     * or within specific states.
     *
     * @param  expression
     * @param  [action]    Default action is DISCARD.
     */
    addRule(expression: string | RegExp, action?: Action): void;

    /**
     * Add multiple rules without explicit state.
     *
     * @param rules       Each item should have expression and action keys.
     */
    addRules(rules: Rule[]): void;

    /**
     * Set source text string to lex.
     *
     * @param source
     */
    setSource(source: string): void;

    /**
     * Run lexer until end or until token will be found.
     *
     * @return Either EOF {@link Lexer.EOF} or specific token produced by action.
     */
    lex(): string | Lexer.EOF;

    /**
     * Run lexer until end, collect all tokens into array and return it.
     *
     * @return  Array of tokens.
     */
    lexAll(): (string | Lexer.EOF)[];

    /** DISCARD action. */
    discard(): undefined;

    /** ECHO action. */
    echo(): void;

    /**
     * BEGIN action.
     *
     * @param [newState] Default is INITIAL state.
     */
    begin(newState?: string): void;
    reject(): void;
    more(): void;
    less(n: number): void;
    unput(s: string): void;
    input(n?: number): string;

    /** TERMINATE action. */
    terminate(): Lexer.EOF;
    restart(newSource?: string): void;
    pushState(newState: string): void;
    topState(): string | undefined;
    popState(): void;
    switchState(newState?: string): void;

    private scan(): string | undefined;
    private logAccept(state: string, expression: RegExp, value: string): void;
    private encodeString(s: string): string;
    private execRegExp(re: RegExp): string | undefined;
    private compileRuleExpression(source: string, flags: string): RegExp;
    private escapeRegExp(s: string): string;
    private isRegExpMatchBOL(re: RegExp): boolean;
    private isRegExpMatchEOL(re: RegExp): boolean;
  }
  export default Lexer;
}
