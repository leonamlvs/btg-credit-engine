# Architecture

## Baseline

The project uses a small modular layered architecture.

```text
HTTP -> runtime validation -> application use case -> domain logic -> response
                                      |
                                      v
                             validated rule config
```

## Boundaries

- Express owns HTTP concerns.
- Zod validates runtime boundaries.
- Application use cases coordinate business operations.
- Domain functions remain independent from Express and deployment infrastructure.
- Business values and conditions belong in data-driven rule configuration when required by the specification.
- The application remains stateless.

## Engineering architecture

```text
challenge source
      |
      v
requirements -> acceptance -> technical plan -> tasks
                                          |
                                          v
                                  Codex / Copilot
                                          |
                               implementation + tests
                                          |
                                  documentation impact
                                          |
                                      yarn verify
                                          |
                               AI review + human review
```

The repository itself is part of the engineering harness: specifications, agent instructions, tests, deterministic checks, and CI constrain AI-assisted implementation.
