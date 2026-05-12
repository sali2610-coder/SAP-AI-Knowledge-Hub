// Minimal Tricentis Tosca / T-Box grammar for react-syntax-highlighter.

const grammar = {
  comment: { pattern: /\/\/.*/, greedy: true },
  directive: { pattern: /\{[A-Z_]{2,}[^}]*\}/, greedy: true },
  module: { pattern: /\bTBox(?:\s|:)[^\n]+/, greedy: true },
  "action-mode": /\b(?:Input|Verify|Buffer|Constraint|WaitOn|Optional)\b/,
  variable: { pattern: /\{\$?[A-Z_][A-Z0-9_]*\}/, greedy: true },
  string: { pattern: /"(?:[^"\\\n]|\\.)*"/, greedy: true },
  number: /\b\d+(?:\.\d+)?\b/,
  keyword:
    /\b(?:TestCase|TestStep|TestStepValue|TestSheet|TestData|Recovery|Library|Scenario|If|Else|EndIf|While|EndWhile|Set|Buffer)\b/,
  operator: /==|!=|<=|>=|->|=|<|>|\+|-/,
  punctuation: /[{}\[\];:,]/,
};

type LangFn = ((Prism: { languages: Record<string, unknown> }) => void) & {
  displayName: string;
  aliases: string[];
};

const registerTosca: LangFn = ((Prism) => {
  Prism.languages.tosca = grammar as unknown as Record<string, unknown>;
}) as LangFn;
registerTosca.displayName = "tosca";
registerTosca.aliases = [];

export default registerTosca;
