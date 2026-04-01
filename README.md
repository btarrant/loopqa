# loopqa-techeval

Data-driven Playwright test suite for the LoopQA technical evaluation.

## Stack

- TypeScript
- Playwright
- JSON-based scenario data

## Install

```bash
npm install
npx playwright install chromium
```

## Run

```bash
npm test
```

To run with a visible browser:

```bash
npm run test:headed
```

## Structure

- `tests/test-cases.json`: source of truth for the six evaluation scenarios
- `tests/board.spec.ts`: generated tests and shared login/navigation helpers
- `playwright.config.ts`: Playwright configuration

## Notes

- The login page labels the username field as `Username`; the suite uses the provided `admin` and `password123` credentials.
- Each scenario logs in, opens the requested project board, finds the target column, verifies the task card, and asserts the expected tags.
