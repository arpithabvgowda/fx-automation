# FX Automation Framework

[![FX Automation CI](https://github.com/arpithabvgowda/fx-automation/actions/workflows/ci.yml/badge.svg)](https://github.com/arpithabvgowda/fx-automation/actions/workflows/ci.yml)

---

## Overview

FX Automation is a **scalable API testing framework** built with **Playwright** and **TypeScript**, designed to test **foreign exchange APIs** with focus on:

- **Contract validation** using schemas (`Ajv`)
- **Reliable API handling**, including **429 rate limit retries** with exponential backoff
- **Mocking** APIs using **MSW** for deterministic tests
- **Code coverage tracking** with **C8**
- **CI/CD integration** with **GitHub Actions**
- **Structured logging** for easy debugging and traceability

It follows **SDET best practices**, ensuring maintainable, readable, and testable code.

---

## Features

### API Client

- Methods for endpoints: `/latest`, `/convert`, `/symbols`, `{date}` - Historic FX rates
- Handles query parameters (`access_key`, `symbols`, etc.)
- Returns typed responses: `FxBaseResponse`, `LatestRatesResponse`, `ConvertResponse`
- Automatic retries for 429 errors, with exponential backoff

```ts
const { body, status, ok } = await client.getLatestRates("EUR", ["USD", "GBP"]);
```

### Schema Validation

- All API responses validated using Ajv and OpenAPI JSON contracts
- Prevents unexpected breaking changes in API responses
- Throws informative errors when validation fails

```ts
import { schemaValidator } from "./src/api/validators/schemaValidator";
schemaValidator.validate("LatestRatesResponse", response.body);
```

### Mocking with MSW

- Mock API responses with success, error, and 429 retry scenarios
- Ensures deterministic tests locally and in CI

### Logging

- Centralised logging in BaseClient
- Logs retries, errors, and API requests
- Provides full traceability for debugging

### Code Coverage

- Uses C8 for line, branch, and function coverage
- Generates HTML + JSON reports
- Coverage thresholds can be enforced in CI

```ts
npm run test:coverage
open coverage/index.html
```

### GitHub Actions Workflow

- `.github/workflows/ci.yml` automatically runs on push and pull requests to main
- Installs Node, dependencies, and Playwright browsers
- Runs tests with MSW mocks and collects coverage
- Uploads Playwright HTML report and coverage report

```yml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:coverage
      - uses: actions/upload-artifact@v3
        with:
          name: coverage
          path: coverage/
```

## Getting Started

### 1. Clone the Repository

```bash
git clone "https://github.com/arpithabvgowda/fx-automation.git"
cd fx-automation
```

### 2. Install Dependencies

```bash
npm ci
npx playwright install --with-deps
```

## 3. Environment Setup

Create a `.env` file in the root:

```env
#Sent as a query parameter to all FX API requests
API_KEY=your_access_key_here
BASE_URL=https://api.exchangeratesapi.io/
```

### 4. Run Tests Locally

#### Run all tests

```bash
npm test
```

#### Run API tests only

```bash
npm run test:api
```

#### Run tests with coverage

```bash
npm run test:coverage
open coverage/index.html
```

### Test Structure

- `src/api/client/` → FX API client
- `src/api/validators/` → Schema validation
- `tests/api/` → API test specs
- `tests/mocks/` → MSW mocks for API responses

### Retry Logic & Rate Limits

- Client automatically retries requests on 429 Too Many Requests
- Uses Retry-After header if available, else exponential backoff

```ts
if (status === 429 && attempt < maxRetries) {
  const delay = retryAfter ? retryAfter * 1000 : baseDelay * 2 ** attempt;
  await new Promise((res) => setTimeout(res, delay));
  attempt++;
  continue;
}
```

### Logging

- Logs all requests, responses, retries, and errors in BaseClient
- Helps debug failed tests locally or in CI

### Coverage & CI

- C8 instruments code for coverage
- Generates HTML report at coverage/index.html
- GitHub Actions uploads as artifact for review
- Optional thresholds can fail CI if coverage drops

### Recommended Workflow

- Pull the latest `main` branch
- Install dependencies: `npm ci`
- Run API tests with MSW: `npm run test:api`
- Run coverage: `npm run test:coverage`
- Inspect reports: `open coverage/index.html`
- Push changes → GitHub Actions runs CI automatically

![alt text](image.png)

### Author

Arpitha B V – SDET Automation Engineer
