## Parent

`issues/01-ux-improvements.md`

## What to build

Improve the perceived performance of the home route by providing immediate loading feedback. Currently, `app/page.tsx` blocks the entire initial render on a server-side `Promise.all` data fetch. Create an `app/loading.tsx` file that utilizes existing skeleton components (such as `YouTubeFeedSkeleton`) to render a loading state instantly while the server finishes fetching data.

## Acceptance criteria

x `app/loading.tsx` is created and exports a loading component.
x The loading component utilizes existing skeleton UI patterns (e.g., `YouTubeFeedSkeleton`).
x Navigating to the home route immediately shows the loading skeleton before the server-side data resolves.

## Blocked by

- None - can start immediately

- `enhancement`
- `ready-for-agent`
