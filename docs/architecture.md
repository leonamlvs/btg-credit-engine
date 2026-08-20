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

## Rule configuration flow

```text
config/rules/credit-engine.v1.json
               |
               v
startup JSON parsing -> Zod validation -> immutable RuleConfiguration
                                                |
                                                v
                                  generic condition evaluation
```

Published thresholds, priorities, keywords, multipliers, income values, penalties, and limits live
in the versioned JSON document. Evaluator code contains only the bounded operators approved by the
technical plan.

## Classification use case

The transport-independent classification use case coordinates the pure cluster, job-category,
income, penalty, and credit-limit functions. It returns an internal classification result without
mutating the accepted customer or retaining state between calls. Public response field names and
HTTP behavior remain adapter concerns.

## Public HTTP flow

```text
POST /customers/classify
        |
        v
CustomerSchema validation -> injected classifier -> public response mapper -> HTTP 200
        |
        +-> shared validation or malformed-JSON envelope -> HTTP 400
```

The composition root loads and validates the versioned rules once, creates the classifier, and
injects it into the Express application. The request, enriched response, and shared error schemas
are also registered with OpenAPI so runtime and documented contracts remain aligned.

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
