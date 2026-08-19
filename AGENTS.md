# Agent Operating Contract

## Project

BTG Pactual Credit Engine backend challenge.

## Sources of truth

Read these before implementing business behavior:

1. `specs/credit-engine/requirements.md`
2. `specs/credit-engine/assumptions.md`
3. `specs/credit-engine/acceptance.md`
4. `specs/credit-engine/plan.md`

Never invent missing business requirements or official fixtures.

## Architecture boundaries

- Runtime: Node.js 24.19.0.
- Language: TypeScript.
- HTTP: Express.
- Runtime schemas: Zod.
- Business rules must remain data-driven.
- The application is stateless.
- Do not introduce persistence, repositories, ORM, or a database unless explicitly approved.
- Do not introduce authentication unless explicitly approved.
- Do not introduce CORS without a concrete cross-origin requirement.
- Keep HTTP concerns outside core business logic.
- Prefer simple functions over unnecessary abstractions.
- Do not add a production dependency without a concrete reason.

## Schema policy

For runtime boundaries, Zod schemas are the source of truth.

Prefer:

`const Schema = z.object(...);`
`type Value = z.infer<typeof Schema>;`

Do not duplicate the same contract as both a Zod schema and a manually maintained TypeScript interface.

## AI workflow

Before modifying code:

1. Read the relevant specification and existing implementation.
2. State the intended change and affected files.
3. Identify assumptions instead of silently inventing them.
4. Make the smallest change necessary.
5. Add or update tests.
6. Analyze documentation impact.
7. Run `yarn verify`.
8. Review the final diff against the specification.
9. Report remaining risks or open questions.

Do not change requirements merely to make an implementation conform.

## Documentation maintenance

Documentation is part of the Definition of Done.

- Update current-state documentation when behavior changes.
- Update OpenAPI when the public HTTP contract changes.
- Do not rewrite historical ADRs. Supersede them with a new ADR.
- Update `ai-journey/` only for meaningful AI interactions or engineering decisions.
- Do not modify unrelated documentation.

## Verification

A task is not complete unless:

```bash
yarn verify
```

passes.

The gate covers formatting, linting, TypeScript, tests, deterministic documentation checks, and build.

## Review behavior

Review changes adversarially for:

- hard-coded business rules that should be configuration;
- missing boundary tests;
- incorrect priority handling;
- unnecessary abstractions;
- duplicated schemas;
- documentation drift;
- implementation/specification mismatch;
- accidental persistence or state.
