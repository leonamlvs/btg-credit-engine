# Credit Engine Technical Plan

## Summary

Implement the engine inside out, keeping rule values in validated JSON configuration and exposing only small pure domain functions to the application layer.

```text
versioned JSON rules
        ↓
Zod validation at startup
        ↓
typed, immutable RuleConfiguration
        ↓
generic condition evaluation
        ↓
cluster → job → income → penalty → limit
        ↓
pure classification use case
        ↓
request/response Zod contracts
        ↓
Express endpoint → OpenAPI → integration tests
```

The repository currently contains the HTTP, OpenAPI, logging, environment, and verification scaffolding but no credit-engine behavior. Exact midpoint rounding, the enriched output and HTTP contracts, and the official six-sample fixture remain explicit gates under `ASM-007`, `ASM-002`/`ASM-008`, and `ASM-001` respectively.

## Architecture and interfaces

- Organize customer contracts and use-case/HTTP code separately from pure credit-engine domain functions.
- Keep `server.ts` as the composition root: load and validate rules once, construct the classifier, inject it into `createApp`, then listen.
- Use `CustomerSchema` as the request source of truth and infer `Customer` with `z.infer`.
- Configure customer and nested location schemas to accept and preserve unknown properties. Enforce only the constraints approved in `ASM-009`; do not add age, string-content, state, uniqueness, debt-field consistency, or unknown-field rejection constraints.
- Preserve accepted additional customer properties through classification so the HTTP layer can return the supplied customer enriched with calculated data.
- Define `RuleConfigurationSchema` and infer `RuleConfiguration`; domain functions accept only validated configuration.
- Keep the internal `CoreClassification` separate from the unresolved public response contract. It contains the selected cluster/category and calculated income/limit. Only the known `CLUSTER_D` false approval is represented; positive approval semantics are not inferred.
- Do not add dependencies, persistence, authentication, CORS, repositories, or a generalized rule-engine framework.

## Rule configuration

Use `config/rules/credit-engine.v1.json`, loaded relative to the application working directory and validated once before the server listens.

The top-level document contains:

- `schemaVersion`;
- ordered cluster rules;
- ordered job-category rules;
- the complete cluster/category income matrix;
- penalty rules.

Each cluster contains a code, display label, priority, base limit, cap, an all-of condition list, and optional source-known approval metadata. `CLUSTER_D` uses an explicit `always` condition and carries only `approved: false`.

Each job category contains a code, priority, multiplier, and either a case-insensitive substring condition or an explicit `always` fallback for `OTHER`.

Conditions form a small Zod discriminated union limited to:

- numeric `greaterThanOrEqual`;
- numeric `inclusiveRange`;
- boolean `equals`;
- array `containsAny`;
- array `containsNone`;
- string `containsAnySubstringCaseInsensitive`;
- `always`.

The schema validates structural safety: positive unique priorities, unique codes, compatible field/operator combinations, valid debt values, nonnegative monetary values, complete income-matrix references, and one lowest-priority fallback for clusters and job categories. Separate explicit tests verify every approved business value; the schema itself must not hard-code those values.

Evaluation sorts a copy by numeric priority and chooses the first rule whose conditions all match. It never mutates the configuration or customer.

## Dependency flow

```text
T1 → T2 → T3 → T4
             ├→ T5
             └→ T7 → T8 → [midpoint approval] → T9
      └→ T6

T4 + T5 + T6 + T7 + T9 → T10
T1 + T10 + [output/HTTP approval] → T11 → T12 → T13
T12 + [official fixture] → T14
all completed work → T15
```

Tasks 1–4 and 6–8 are currently unblocked. Task 5 remains implementable for all unambiguous job-category cases but is pending and blocked for `Coordinator` until the collision with the higher-priority `COO` keyword is resolved.

Tasks 9–15 retain the following blocking conditions:

- Task 5 is blocked only for the unresolved `Coordinator`/`COO` case; no matching policy is selected by this plan.
- Task 9 is blocked by midpoint semantics (`ASM-007`).
- Task 10 is transitively blocked by Tasks 5 and 9.
- Tasks 11–13 are blocked by the output and HTTP contracts (`ASM-002`, `ASM-008`) and Task 10.
- Task 14 is blocked by the missing official fixture (`ASM-001`) and HTTP contract.
- Full final acceptance in Task 15 is blocked by all preceding unresolved tasks.

## Human approval required

1. Exact midpoint behavior for `round_to_nearest_100`. This affects real configured cases, so it cannot be deferred as a theoretical edge case.
2. The `Coordinator`/`COO` collision: matching is case-insensitive substring matching anywhere, `COO` is a higher-priority `EXECUTIVE` keyword, and `Coordinator` is a `SENIOR_PROFESSIONAL` keyword. A human must approve the intended behavior; this plan does not select word boundaries, tokenization, exact-match exceptions, or literal-priority behavior.
3. Complete enriched output schema: calculated field names, nesting, types, monetary serialization, and approval semantics for clusters A–C.
4. Exact HTTP contract: success/error statuses, validation-error body, and malformed-JSON behavior.
5. Receipt or confirmed unavailability of the official `expected-output.json`. This is an external artifact decision, not an architectural choice.

Approval of this plan is sufficient to adopt the proposed versioned JSON rule representation under existing ADR-002. No additional dependency or architectural framework needs approval for Tasks 1–4 or 6–8, or for the unambiguous portion of Task 5. The midpoint interpretation should be resolved in `assumptions.md` and tests without creating an ADR solely for that decision. A materially architectural public output/HTTP decision may justify a new ADR.
