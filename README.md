# loopqa-techeval

Data-driven Playwright test suite for the LoopQA technical evaluation, expanded into a production-style QA automation structure.

## Stack

- TypeScript
- Playwright
- JSON-based scenario data
- Page Object Model
- Authenticated storage state setup
- Axe accessibility checks
- GitHub Actions CI

## Install

```bash
npm install
npx playwright install chromium
```

## Run

```bash
npm test
```

To run only smoke coverage:

```bash
npm run test:smoke
```

To run only regression coverage:

```bash
npm run test:regression
```

To run with a visible browser:

```bash
npm run test:headed
```

## Structure

- `tests/test-cases.json`: source of truth for the six required scenarios
- `tests/smoke.spec.ts`: data-driven happy-path coverage generated from the JSON scenarios
- `tests/regression.spec.ts`: edge cases, session checks, accessibility checks, and mobile coverage
- `tests/auth.setup.ts`: authenticated state generation for browser projects
- `tests/fixtures.ts`: shared fixtures and failure diagnostics
- `playwright/pages/`: page object layer for login, projects, and board interactions
- `playwright.config.ts`: browser projects, retries, reporters, and authenticated setup dependency
- `.github/workflows/playwright.yml`: CI pipeline for smoke and regression execution

## Notes

- The login page labels the username field as `Username`; the suite uses the provided `admin` and `password123` credentials.
- The smoke suite validates each required scenario and also checks that the target card does not appear in the wrong columns.
- The regression suite adds invalid login coverage, authenticated session persistence, logout behavior, mobile viewport validation, displayed-count integrity checks, and accessibility auditing.
- Chromium and Firefox are verified locally in this environment. WebKit is configured for CI because local WebKit execution is not supported on this macOS version.
