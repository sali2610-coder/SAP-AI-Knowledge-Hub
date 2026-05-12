// Minimal ABAP grammar for react-syntax-highlighter (Prism).
// Exposed as a registerLanguage callback so PrismLight can install it.

export type PrismLanguageDef = unknown;

const KEYWORDS =
  "ABSTRACT|ALIAS|ALIASES|AND|APPENDING|ASSIGN|ASSIGNING|AT|BEGIN|BREAK|BY|CALL|CASE|CATCH|CHANGING|CHECK|CLASS|CLASS-DATA|CLASS-METHODS|CLEAR|CLOSE|COMMIT|COMPUTE|CONCATENATE|COND|CONDENSE|CONSTANTS|CONTINUE|CONTROLS|CONVERT|CORRESPONDING|CREATE|DATA|DEFAULT|DEFINE|DEFINITION|DELETE|DESCRIBE|DO|ELSE|ELSEIF|END|END-OF-SELECTION|ENDCASE|ENDCATCH|ENDCLASS|ENDDO|ENDEXEC|ENDFORM|ENDFUNCTION|ENDIF|ENDINTERFACE|ENDLOOP|ENDMETHOD|ENDMODULE|ENDON|ENDSELECT|ENDTRY|ENDWHILE|ENHANCEMENT|ENHANCEMENT-POINT|ENHANCEMENT-SECTION|EXCEPTIONS|EXEC|EXIT|EXPORT|EXPORTING|FIELD|FIELD-SYMBOLS|FOR|FORM|FROM|FUNCTION|GET|GROUP|IF|IMPLEMENTATION|IMPORTING|IN|INHERITING|INSERT|INTERFACE|INTERFACES|INTO|IS|LET|LIKE|LINE|LOOP|MAX|MESSAGE|METHOD|METHODS|MODIFY|MODULE|MOVE|NEW|NEXT|OF|ON|OPEN|OPTIONAL|OR|OTHERS|PARAMETERS|PERFORM|PRIVATE|PROCEDURE|PROTECTED|PUBLIC|RAISE|RAISING|READ|READING|REDEFINITION|REFERENCE|REPORT|RESULT|RESULTS|RETURN|RETURNING|ROLLBACK|SELECT|SELECT-OPTIONS|SET|SHIFT|SHIFT-RIGHT|SIGN|SIZE|SORT|SORTED|SPLIT|STATIC|STRUCTURE|SUM|SUPPRESS|SWITCH|SYSTEM-CALL|TABLE|TABLES|THEN|TO|TRANSLATE|TRY|TYPE|TYPE-POOL|TYPE-POOLS|TYPES|UNTIL|UP|UPDATE|USING|VALUE|WAIT|WHEN|WHERE|WHILE|WITH|WRITE|XSDBOOL";

const TYPES =
  "abap_bool|abap_true|abap_false|c|d|f|i|n|p|t|x|string|xstring|sap_bool|TYPE_OF";

const grammar = {
  comment: [
    { pattern: /^\*.*/m, greedy: true },
    { pattern: /"[^"\n]*/ },
  ],
  string: { pattern: /'(?:[^'\\\n]|'')*'/, greedy: true },
  "template-string": { pattern: /\|(?:[^|\\\n]|\\.)*\|/, greedy: true },
  number: /\b\d+(?:\.\d+)?\b/,
  keyword: new RegExp(`\\b(?:${KEYWORDS})\\b`, "i"),
  builtin: new RegExp(`\\b(?:${TYPES})\\b`, "i"),
  operator: /->|=>|<=|>=|<>|\|\||::|[-+*/=<>?]|@/,
  punctuation: /[.,;:()\[\]]/,
};

// refractor (used by PrismLight) requires the registration callback to have
// `displayName` and `aliases` set on it - mirroring how the built-in language
// modules from react-syntax-highlighter export their grammars.
type LangFn = ((Prism: { languages: Record<string, unknown> }) => void) & {
  displayName: string;
  aliases: string[];
};

const registerAbap: LangFn = ((Prism) => {
  Prism.languages.abap = grammar as unknown as Record<string, unknown>;
}) as LangFn;
registerAbap.displayName = "abap";
registerAbap.aliases = [];

export default registerAbap;
