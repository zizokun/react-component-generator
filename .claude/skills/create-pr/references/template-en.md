# PR Body Template (English)

Use only when the repository has no PR template of its own. Keep the section headings as-is, and delete any optional section that has no content. Do not leave empty sections or "N/A". The HTML comments are writing guidance; remove them from the final body.

## Template

```markdown
## Summary

<!-- 1-3 sentences on what this PR changes and why. The reviewer should understand the intent before opening the diff. -->

## Changes

<!-- Bullet points describing changes in behavior, from the user's point of view. Describe what is different, not which files changed. -->
-

## Verification

<!-- Only commands you actually ran and their results. For manual checks, say what you checked and how. -->
- `<command>` — <result>

## Review Notes (optional)

<!-- Where the reviewer should look closely: design decisions, trade-offs, low-confidence areas, things intentionally left out. -->
-

## Related Issues (optional)

<!-- Only when an issue number appears in a commit message or branch name. Use "Closes #number" for issues this PR resolves. -->
```

## Writing Guidelines

- **Summary**: Describe the outcome, not just what was added. Do not concatenate commit messages.
- **Changes**: With multiple commits, group by meaning rather than by commit. List behavior-preserving refactors on a separate line.
- **Verification**: Do not hide failed checks. If you added tests, state in one line what they verify.
- **Review Notes**: Record remaining limitations or follow-up work here, so reviewers do not have to ask the same questions.

## Example

```markdown
## Summary

Prompts longer than 500 characters now show an error in the input field and cannot be submitted.

## Changes

- Add a `validatePrompt` util that ignores leading/trailing whitespace and counts by code point
- Show an error message above 500 characters and block both the generate button and Cmd+Enter submission

## Verification

- `bun run test` — 22 passed (4 new util tests, 4 new PromptInput tests)
- `bun run lint`, `bunx tsc -b` — passed

## Review Notes

- The length limit is client-side only. Calling `/api/generate` directly bypasses it; server-side validation is left as follow-up work.
```
