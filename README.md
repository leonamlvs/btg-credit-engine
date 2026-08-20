# BTG Pactual Credit Engine

Data-driven credit classification API built with Node.js, TypeScript, Express, and Zod.

The API classifies customers into credit-risk clusters, estimates monthly income, and calculates a
personalized credit limit.

## Live demo

Not deployed yet:

- Swagger UI: <https://btg-credit-engine.onrender.com/docs>
- Health check: <https://btg-credit-engine.onrender.com/health>

## Run with Docker

```bash
docker build -t credit-engine .
docker run --rm -p 3000:3000 credit-engine
```

Swagger UI: <http://localhost:3000/docs>

## Run locally

Requirements: Node.js `24.19.0` and Yarn `4.18.0`.

```bash
yarn install --immutable
yarn dev
```

Swagger UI: <http://localhost:3000/docs>

Use Swagger to execute `POST /customers/classify` with the documented request schema.

## Verification

```bash
yarn verify
```

This runs formatting, linting, type checking, unit and integration tests, documentation checks, and
the production build.

## Project highlights

- Business rules are versioned in
  [`config/rules/credit-engine.v1.json`](config/rules/credit-engine.v1.json) and validated at startup.
- The application is stateless, with pure domain logic separated from HTTP concerns.
- Zod schemas provide runtime validation and generate the OpenAPI contract used by Swagger.

More details: [architecture](docs/architecture.md), [specification](specs/credit-engine/), and
[AI-assisted development journey](ai-journey/).
