## Parent

`issues/01-ux-improvements.md`

## What to build

Un-silence client-side API failures and prevent conflicting error/empty states. First, the `handleAnalyze` function in `app/watch/[id]/page.tsx` currently has an empty `catch` block; this must be replaced with logic that sets an error state and displays a visual error message (like a toast or inline text). Second, the search results rendering logic in `HomeContent.tsx` needs a guard clause to ensure that the "No results found" empty state does not render at the same time as an error message.

## Acceptance criteria

x `app/watch/[id]/page.tsx` `handleAnalyze` catch block sets a visible error state instead of swallowing the error.
x Simulating an error in `handleAnalyze` correctly displays the error UI to the user.
x `HomeContent.tsx` exclusively renders either the search error message or the empty state, never both simultaneously.
x The existing Jest test suite passes without regression.

## Blocked by

- None - can start immediately

- `enhancement`
- `ready-for-agent`
