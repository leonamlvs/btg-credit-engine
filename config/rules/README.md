# Business Rule Configuration

`credit-engine.v1.json` is the versioned source of truth for the published credit-engine
business values and conditions. It is validated once at application startup before any request is
accepted.

The schema deliberately supports only the operators required by the approved specification. Rule
changes must preserve the structural invariants enforced by the runtime schema and must be covered
by exact-value tests.
