// commitlint.config.mjs
export default {
  extends: ["@commitlint/config-conventional"],
  /*
   * Optional: tailor to your repo
   */
  rules: {
    // enforce a known set of types
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "style",
        "refactor",
        "perf",
        "test",
        "build",
        "ci",
        "chore",
        "revert",
      ],
    ],
    // recommend short headers
    "header-max-length": [2, "always", 100],
    // require blank line before body & footer
    "body-leading-blank": [2, "always"],
    "footer-leading-blank": [2, "always"],
    // optional: define allowed scopes for nicer consistency
    // "scope-enum": [2, "always", ["astro", "ui", "infra", "deps", "release", "docs"]]
  },
  /*
   * Optional: ignore merge commits etc.
   */
  ignores: [(message) => message.startsWith("Merge ")],
};
