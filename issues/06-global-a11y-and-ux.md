## Parent

`issues/01-ux-improvements.md`

## What to build

A sweeping pass across multiple components to fix dark mode color contrast, semantic HTML attributes, and touch target sizes.
1. Update `text-gray-500` and `text-gray-600` classes to `text-gray-400` (or lighter) on dark backgrounds across the app (including `Header.tsx`, `YouTubeFeed.tsx`, `VideoCard.tsx`, `SearchPanel.tsx`, `HomeContent.tsx`, `HeroSection.tsx`, `RecommendationsPanel.tsx`, `Features.tsx`, and `app/page.tsx`).
2. Add descriptive `alt` tags to the avatar in `Header.tsx` and all thumbnails in `SearchPanel.tsx` and `RecommendationsPanel.tsx`.
3. Add `aria-label`, `aria-expanded`, and `aria-current` to icon-only buttons (like Back arrows and Search Clear buttons).
4. Increase padding (`p-2` or `p-3`) on interactive elements (particularly the Back arrow in `app/watch/[id]/page.tsx`) to hit a minimum 44x44px touch target size.
5. Update the search input in `SearchPanel.tsx` to `text-base` (or `md:text-sm text-base`) to prevent iOS Safari auto-zoom.

## Acceptance criteria

x All instances of poor contrast (`text-gray-500/600` on dark backgrounds) are updated in the specified files.
x Avatar and video thumbnails have `alt` text.
x Icon-only buttons have descriptive `aria-label`s.
x Interactive buttons (especially watch page header buttons) have padding ensuring a >44px touch target.
x Search input in `SearchPanel.tsx` uses `text-base` for mobile viewports.
x Automated accessibility tests (`axe`) pass across modified components.
x The existing Jest test suite passes without regression.

## Blocked by

- issues/02-setup-a11y-infra.md

- `enhancement`
- `ready-for-agent`
