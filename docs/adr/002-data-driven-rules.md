# ADR-002 â€” Represent business rules as validated configuration

- Status: Accepted

## Context

The challenge explicitly requires the classification engine to be data-driven rather than burying business rules in application logic.

## Decision

Represent business rules in versioned configuration files and validate them at startup.

Keep the evaluator generic and limited to operators actually required by the specification.

## Consequences

- Business values can change without rewriting classification branches.
- Configuration becomes a runtime boundary and must be validated.
- The project must avoid building an unnecessarily general rule-engine framework.
