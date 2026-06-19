## Parent

`issues/01-ux-improvements.md`

## What to build

Convert the user profile dropdown in the header to be mobile-friendly and fully keyboard accessible. The current implementation in `Header.tsx` relies on a CSS `group-hover` utility, which is broken on touch devices and inaccessible to keyboard users. Extract or refactor the dropdown into a Client Component that uses React state (`isOpen`, `setIsOpen`) triggered by a click. Add focus management (trapping focus inside the menu when open, returning focus to the trigger when closed), an 'outside-click' listener to dismiss, and an `Escape` key listener to close the menu.

## Acceptance criteria

x Profile dropdown in `Header.tsx` triggers on click/tap, not hover.
x Dropdown closes when clicking outside the menu component.
x Dropdown closes when the `Escape` key is pressed.
x Focus moves into the dropdown when opened, and returns to the profile trigger button when closed.
x Automated accessibility tests (`axe`) pass for the new dropdown state logic.
x The existing Jest test suite passes without regression.

## Blocked by

- issues/02-setup-a11y-infra.md

- `enhancement`
- `ready-for-agent`
