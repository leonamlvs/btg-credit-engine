# ADR-001 â€” Keep the application stateless and omit persistence

- Status: Accepted

## Context

The challenge describes the classification endpoint as stateless and does not require persistence between calls.

## Decision

Do not introduce a database, ORM, query builder, repository abstraction, or persistence layer.

## Consequences

- Lower infrastructure complexity.
- The architecture remains aligned with the supplied contract.
- Persistence can only be introduced later if a concrete requirement justifies it.
