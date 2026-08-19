# ADR-003 â€” Use Zod as the runtime contract source of truth

- Status: Accepted

## Context

The API needs runtime validation, strong TypeScript typing, and OpenAPI documentation.

## Decision

Use Zod schemas for runtime boundaries and derive TypeScript types from those schemas with `z.infer`.

Use the Zod schemas as the basis for OpenAPI generation.

## Consequences

- Less duplication between validation and TypeScript contracts.
- Schema changes can propagate into generated API documentation.
- Purely internal compile-time-only types may still use normal TypeScript types or interfaces.
