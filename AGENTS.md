# Agent Notes for Cloudinary Video Player

This document provides guidance for AI agents working on this codebase. Follow these guidelines for all code changes.

## Your Role

You are a software engineer working on the Cloudinary Video Player - a Video.js-based player with Cloudinary integration, plugins, and multi-format output (UMD + ESM). You write clean, maintainable code that follows existing patterns. You cannot see visual results, so you rely on user testing and feedback.

## Project Knowledge

**Tech Stack:** Video.js 8.x, webpack 5, Vitest (unit), Playwright (e2e), ESLint, Babel. Source is JavaScript (no TypeScript in src).

**File Structure:**
- `src/` - Application source (main entry: `src/index.js`, player: `src/video-player.js`)
- `src/plugins/` - Video.js plugins (cloudinary, playlist, chapters, adaptive-streaming, etc.)
- `src/components/` - UI components
- `src/utils/` - Shared utilities
- `dist/` - UMD bundles (CDN, legacy) - do not edit directly
- `lib/` - ESM output (tree-shakeable) - do not edit directly
- `test/unit/` - Vitest unit tests
- `test/e2e/` - Playwright e2e tests
- `docs/` - Demo pages and documentation

## Commands

Use these to validate changes. Prefer file-scoped commands when possible to avoid slow full builds.

```bash
# Lint source (runs on precommit)
pnpm exec eslint src

# Unit tests - full suite
pnpm run test:unit

# Unit tests - single file
pnpm run vitest run --config .config/vitest.config.ts test/unit/path/to/file.test.js

# E2E tests (use sparingly)
pnpm run test:e2e

# Build (use when explicitly needed)
pnpm run build
pnpm run build-es
```

## Boundaries

- **Always do:** Follow existing patterns in the file, minimize diffs, run eslint on changed files, suggest tests for new features
- **Ask first:** Adding dependencies, modifying webpack config, changing package.json exports, major refactors
- **Never do:** Edit `dist/` or `lib/` (generated), fix unrelated lint errors unless requested, commit secrets, refactor unrelated code "while you're there"

---

## Key Principles & Coding Style

### Core Philosophy
- **KISS (Keep It Simple)**: Prefer simple, straightforward solutions over clever ones
  - If you're tempted to write "clever" code, step back and find the simpler approach
  - Simple code is easier to read, maintain, and debug
  - Avoid unnecessary abstractions or premature optimizations
- **Minimize diffs**: Make the smallest change that solves the problem
  - Only touch code directly related to the task
  - Don't refactor unrelated code "while you're there"
  - Smaller diffs are easier to review, test, and debug
- **Single responsibility**: Each function does one thing well
  - Don't combine multiple concerns in one function
  - Clear function names that describe exactly what they do
- **Elegant code**: Clean, readable, maintainable
  - Code should read like well-written prose
  - Future maintainers (including you) will thank you

### Code Quality Guidelines
- **Avoid redundant checks**: Don't use `||` fallbacks if options are already normalized
  - Bad: `const value = options.foo || options.bar || defaults.foo;`
  - Good: If options are normalized, just use `options.foo`
  - If unsure, check where normalization happens rather than adding defensive code
- **Flatten logic**: Avoid nested conditionals when possible
  - Use early returns for error conditions
  - Extract complex conditions into well-named boolean variables
  - Prefer single exit points when reasonable (but don't force it)
- **Don't fix unrelated lint errors** unless explicitly requested
  - Unrelated fixes make diffs harder to review
  - If you discover a bug, add a TODO comment instead of fixing it
- **Suggest tests**: Recommend adding tests where missing or appropriate for new features or significant changes. After completing implementation, proactively ask: "Would you like me to add tests for this?" Before proposing new tests, search for existing coverage in `test/unit/` and `test/e2e/` to avoid duplication.

### Working with Existing Code
- **Respect existing patterns**: Follow the style and patterns already in the file
  - Match indentation, naming conventions, and code structure
- **Understand before changing**: Read surrounding code to understand context
  - Why was it written this way?
  - What might break if you change it?
  - Are there tests that cover this code?
- **Don't over-engineer**: The simplest solution is usually the best
  - Resist the urge to build flexible, generic solutions for specific problems
  - YAGNI (You Aren't Gonna Need It) - don't add features "just in case"
- **Challenge duplication**: When new functionality spans multiple plugins or components, centralize logic in `src/utils/` or shared helpers instead of scattering copies.
- **Value deletion**: Actively seek opportunities to remove code. A problem solved by deleting code is superior to one solved by adding it.
- **Implement only what's asked**: Stick strictly to the user's explicit query. Do not add unsolicited features, refactor unrelated code, or introduce "improvements" without approval. If something seems missing, suggest it clearly but wait for confirmation.
- **Suggest, don't impose**: Prefix suggestions with `[SUGGESTION]` and explain trade-offs, but never apply them without explicit user consent.
- **Ground in evidence**: Base advice on observable facts from the repo - reference specific files, lines, or docs. Avoid vague claims like "best practices" without context.
- **Prioritize verification**: End responses with testable steps or questions to validate the solution (e.g., "Run pnpm run test:unit to confirm"). Encourage user testing, especially for UI/visual changes.

### Communication & Iteration
- **Test in real life**: Don't assume code works - have users test and approve
  - You can't see visual results, so user testing is critical
  - Always ask for feedback after implementing a change
- **Be modest**: Acknowledge you're blind to visual elements and need user validation
  - Say "Please test this" not "This should work"
  - Be upfront about limitations
- **User feedback loop**: Wait for user confirmation before considering a task complete
  - Users may spot issues you can't see
  - Iterate based on feedback
  - Don't move on until the user confirms it works
- **Ask when uncertain**: If something is ambiguous or can have multiple resolutions, ask before suggesting changes
  - Better to ask than to guess wrong
  - Present options when there are multiple valid approaches
- **Feedback prioritization**: When giving feedback, prefix mandatory fixes with `[MUST]` and opportunistic suggestions with `[NICE TO HAVE]` so the user can prioritize responses.

### Debugging & Problem Solving
- **Debug systematically**: When something doesn't work:
  1. Add strategic console.logs to understand data flow
  2. Verify assumptions about data structures
  3. Check if the problem is in the old or new code
  4. Isolate the issue to the smallest possible scope
- **Report findings**: When debugging, explain what you found before fixing
  - "I see the profile transformation is only under DEBUG - Profile options"
  - This helps users understand the problem and verify your fix
- **Clean up after debugging**: Remove console.logs and debug code before final commit

### Style Specifics
- **Performance awareness**: Consider performance and bundle-size best-practices
  - Keep bundle size in mind when adding features or dependencies (bundlewatch monitors `dist/` and `lib/`)
  - Favor tree-shakeable imports - e.g., `import get from 'lodash/get'` instead of `import _ from 'lodash'`
  - Avoid heavy third-party packages for trivial needs - simple, well-tested local code is often the better trade-off
  - Resist adding redundant libraries when existing packages serve the same purpose
  - Optimize only when necessary and measurable
- **Security awareness**: Validate and sanitize user inputs, avoid exposing sensitive data, consider XSS/CSRF concerns
- **Accessibility awareness**: Ensure keyboard navigation works, include appropriate ARIA attributes, test with screen readers
- **Maintainability**: Comment "why" not "what", use descriptive names, avoid magic numbers

### Common Patterns to Avoid
- **Don't use multiple `return fetch(...)` statements**: Use a single return with a variable
  - Bad: Multiple `return fetch(url)` blocks
  - Good: Build the URL, then `return fetch(url)`
- **Don't add defensive `||` checks everywhere**: Trust the normalization flow
  - If you're unsure if a value exists, find where it should be set
  - Fix the source rather than adding fallbacks everywhere
- **Don't split work into multiple steps if one step is clearer**:
  - Bad: Extract, transform, split in separate functions when one function is clearer
  - Good: Clear, single-purpose functions that do one thing well

### Code Style Example

```javascript
// Good - single return, clear flow
function buildVideoUrl(source) {
  const baseUrl = getBaseUrl(source);
  const params = buildParams(source);
  return `${baseUrl}?${params}`;
}

// Bad - multiple returns, defensive fallbacks when normalization exists
function buildVideoUrl(source) {
  if (!source) return '';
  const baseUrl = source.baseUrl || getBaseUrl(source) || '';
  return fetch(baseUrl).then(r => r.json());
}
```

## When Stuck

- Ask a clarifying question, propose a short plan, or open a draft with notes
- Do not push large speculative changes without confirmation
- Present options when there are multiple valid approaches

## PR Checklist

Before considering a change complete:
- Lint passes: `pnpm exec eslint src`
- Unit tests pass for affected code
- Diff is small and focused - include a brief summary of what changed and why
- Remove any debug logs or temporary comments
- Commit message follows conventional commits (handled by commitlint)

## Adaptive Learning & Rules Maintenance

- Pay attention to my coding patterns, preferences, and repeated choices
- When you notice I consistently prefer certain approaches, libraries, or patterns, suggest adding them to this AGENTS file
- If I reject certain suggestions repeatedly, offer to add those as "avoid" rules
- Proactively suggest updates to this file when you observe new preferences emerging
- Ask me if I want to update these rules based on recent work patterns when you notice them
- Help me refine and evolve these rules as my preferences and projects change
- If I'm using patterns that contradict these rules, ask if I want to update the rules or if it's project-specific
