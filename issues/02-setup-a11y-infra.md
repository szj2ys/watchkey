## Parent

`issues/01-ux-improvements.md`

## What to build

Set up automated accessibility testing infrastructure for the project's test suite. This involves installing `jest-axe` (and `@axe-core/react` if needed for browser-level checks) and configuring the Jest setup file so that accessibility assertions (`toHaveNoViolations`) can be made in the test suite moving forward.

## Acceptance criteria

x `jest-axe` is added to `package.json` devDependencies.
x Jest setup files are configured to extend `expect` with `jest-axe` matchers.
x At least one basic component test successfully runs an `axe` check to verify the infrastructure works.

## Blocked by

- None - can start immediately

- `enhancement`
- `ready-for-agent`
