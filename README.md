# btg-credit-engine

BTG Pactual Credit Engine backend challenge.

## Current status

The repository is bootstrapped, but the business classification engine is intentionally not implemented yet.

The next development step is to extract and review the challenge requirements and acceptance criteria before asking an AI coding agent to implement business behavior.

## Stack

- Node.js 24.19.0
- TypeScript
- Express 5
- Zod 4
- OpenAPI / Swagger UI
- Jest + Supertest
- ESLint + Prettier
- Pino
- Helmet
- Yarn 4
- GitHub Actions
- Docker

## Local development

`powershell
yarn install --immutable
yarn dev
`

Default endpoints:

- GET /health
- GET /openapi.json
- GET /docs

## Verification

`powershell
yarn verify
`

The verification gate includes formatting, linting, type checking, tests, deterministic documentation checks, and build.

## Useful commands

`powershell
yarn dev
yarn test
yarn test:watch
yarn test:coverage
yarn lint
yarn typecheck
yarn format
yarn format:check
yarn docs:check
yarn build
yarn verify
`

## Project documentation

- [Architecture](docs/architecture.md)
- [Requirements](specs/credit-engine/requirements.md)
- [Assumptions](specs/credit-engine/assumptions.md)
- [Acceptance criteria](specs/credit-engine/acceptance.md)
- [Technical plan](specs/credit-engine/plan.md)
- [Tasks](specs/credit-engine/tasks.md)
- [Architecture decisions](docs/adr/)
- [AI journey](ai-journey/)
- [Agent operating contract](AGENTS.md)

## Important scope decisions

- The application is stateless.
- No persistence layer is introduced without a concrete requirement.
- Authentication is outside the initial challenge scope.
- Business rules will be data-driven and validated.
- Runtime contracts use Zod as the source of truth.
- AI-generated changes must pass the same deterministic yarn verify gate used locally and in CI.
