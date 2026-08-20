# Credit Engine Tasks

Every task ends with its targeted tests passing, documentation impact addressed, `yarn verify` passing, and an adversarial diff review against the listed requirements and acceptance criteria.

## 1. Customer runtime contract — unblocked

- References: `REQ-003`–`REQ-006`; `AC-001`–`AC-003`.
- Scope: implement nested Zod customer, region, and debt-type schemas and inferred types; configure customer and nested location objects to accept and preserve unknown properties.
- Non-scope: HTTP errors, response schema, cross-field consistency, extra validation, unknown-field rejection, or silently stripping accepted additional properties.
- Tests: required fields/types, score endpoints and failures, every enum value and invalid values, nested location, inconsistent debt fields accepted, no global ID check, and additional top-level and nested properties preserved in parsed output.
- Documentation: none beyond task traceability.
- Blocking assumptions: none; follow `ASM-004`, `ASM-005`, and `ASM-009`.
- Done: the schemas enforce exactly the approved request constraints and retain every additional property accepted by the runtime contract; `yarn verify` passes.

## 2. Validated versioned rule configuration — unblocked

- References: `REQ-002`, `REQ-008`–`REQ-020`, `REQ-024`; `AC-018`, `AC-033`.
- Depends on: Task 1.
- Scope: add the JSON representation, Zod schema, parser, startup loader, invariants, and exact-value tests.
- Non-scope: condition evaluation, hot reload, environment-selected files, or business calculation.
- Tests: approved configuration parses; exact clusters, keywords, multipliers, matrix, and penalty values match the specification; malformed conditions, duplicate identities/priorities, missing fallbacks, and incomplete matrix data fail.
- Documentation: replace the placeholder rule README and update the current-state architecture flow.
- Blocking assumptions: none.
- Done: configuration loads deterministically before request handling without embedding published rule values in evaluator code; `yarn verify` passes.

## 3. Generic condition evaluator — unblocked

- References: `REQ-002`, `REQ-007`, `REQ-012`, `REQ-013`, `REQ-024`; `AC-011`, `AC-017`, `AC-020`, `AC-033`.
- Depends on: Task 2.
- Scope: implement pure evaluation of the approved condition union and all-of groups.
- Non-scope: arbitrary field paths, expression parsing, dynamic code, OR trees, or future operators.
- Tests: every operator, inclusive ranges, both array operators, mixed-case substring matching, `always`, and multi-condition conjunction.
- Documentation: no change beyond architecture if the final shape differs from Task 2.
- Blocking assumptions: none.
- Done: all configured operators behave deterministically and evaluator branches contain no published thresholds, keywords, or monetary values; `yarn verify` passes.

## 4. Cluster classification — unblocked

- References: `REQ-007`–`REQ-011`, `REQ-029`; `AC-004`–`AC-011`, relevant portions of `AC-024` and `AC-029`.
- Depends on: Task 3.
- Scope: select the first matching configured cluster by priority.
- Non-scope: job, income, penalty, limit, or HTTP behavior.
- Tests: every threshold and age boundary, default-debt exclusion from B, C regardless of debt/age, D fallback, and first-match priority.
- Documentation: none.
- Blocking assumptions: none; inclusive ages follow `ASM-003` and debt fields remain independent under `ASM-004`.
- Done: selection exposes the configured code, label, limits, and D's known false approval metadata; `yarn verify` passes.

## 5. Job-category classification — pending; blocked for Coordinator

- References: `REQ-012`–`REQ-018`, `REQ-030`; `AC-012`–`AC-017`, `AC-029`.
- Depends on: Task 3.
- Scope: implement selection for every unambiguous configured category and keyword; complete the `Coordinator` case only after a human-approved rule resolves its collision with `COO`.
- Non-scope: choosing word boundaries, tokenization, exact-match exceptions, literal-priority behavior, fuzzy matching, or localization as the intended resolution.
- Tests: every unambiguous keyword embedded in mixed-case text, all category multipliers, `OTHER`, and the specified multi-category priority phrase; keep the `Coordinator` expectation pending until the approved resolution is available.
- Documentation: none.
- Blocking issue: `Coordinator` contains the higher-priority substring `COO` under the published matching rules. This case requires human approval and must not be resolved implicitly or recorded as a new assumption in this task.
- Done: all unambiguous job-category behavior is configuration-backed and tested; Task 5 remains pending until the approved `Coordinator` behavior and its test are added; `yarn verify` passes for the implementable subset.

## 6. Monthly-income lookup — unblocked

- References: `REQ-019`, `REQ-020`, `REQ-032`; `AC-018`, relevant portions of `AC-024` and `AC-029`.
- Depends on: Task 2.
- Scope: implement a pure lookup from the validated cluster/category matrix.
- Non-scope: income calculation or inference outside the matrix.
- Tests: parameterized assertions for all 20 combinations.
- Documentation: none.
- Blocking assumptions: none.
- Done: every pair returns the exact configured BRL number, including all D values as zero; `yarn verify` passes.

## 7. Penalty-factor evaluation — unblocked

- References: `REQ-023`, `REQ-024`, `REQ-031`; `AC-020`, `AC-022`, `AC-029`.
- Depends on: Task 3.
- Scope: evaluate the configured default-debt rule and return `0.5` or identity `1.0`.
- Non-scope: stacking penalties or defining future combination semantics.
- Tests: credit default, loan default, both together, and no default; both defaults activate only once.
- Documentation: none.
- Blocking assumptions: none; follow `ASM-006`.
- Done: default debt activates the configured factor exactly once and a non-match returns the approved identity factor; `yarn verify` passes.

## 8. Pre-round credit-limit arithmetic — unblocked

- References: non-rounding portions of `REQ-021`, `REQ-023`, `REQ-031`; `AC-019`, `AC-021`, `AC-022`, `AC-029`.
- Depends on: Task 7.
- Scope: implement pure multiplication in the required order followed by cap enforcement.
- Non-scope: selecting a midpoint policy or presenting a final approved limit.
- Tests: base formula, penalty-before-cap, capped and uncapped examples.
- Documentation: explicitly record that final rounding remains pending.
- Blocking assumptions: none for capped pre-round results; final rounding remains under `ASM-007`.
- Done: the function deterministically produces the capped pre-round value without choosing midpoint behavior; `yarn verify` passes.

## 9. Nearest-hundred rounding and final limit — blocked by ASM-007

- References: `REQ-021`, `REQ-022`, `REQ-031`; `AC-019`, `AC-021`–`AC-024`, `AC-029`.
- Depends on: Task 8 and an approved midpoint rule.
- Scope: implement nearest-100 rounding after capping and compose the final limit function.
- Non-scope: silently choosing half-up, half-even, or another rule.
- Tests: `10,149 → 10,100`, `10,151 → 10,200`, D always zero, approved midpoint cases, and real rule combinations that produce `1,750` or `3,750` before rounding.
- Documentation: record the approved interpretation by resolving `ASM-007` and document its verification in tests; do not create an ADR solely for this decision.
- Blocking assumptions: `ASM-007`.
- Done: all numeric inputs, including exact midpoints, have approved deterministic behavior; `yarn verify` passes.

## 10. Core classification use case — transitively blocked by Tasks 5 and 9

- References: `REQ-001`, `REQ-007`, `REQ-019`–`REQ-024`, `REQ-027`; `AC-024`, `AC-033`.
- Depends on: Tasks 4–9.
- Scope: coordinate cluster, job, income, penalty, and final-limit functions using validated rules; return an internal result without mutating input.
- Non-scope: choosing external field names, serialization, status codes, or error bodies.
- Tests: spec-derived end-to-end core cases, priority interactions, default penalty, cap, D denial, and repeated independent calls.
- Documentation: update architecture to show the implemented use-case boundary.
- Blocking issues: the unresolved `Coordinator` case from Task 5 and transitively `ASM-007`; the internal result must not resolve `ASM-002` or `ASM-008`.
- Done: identical inputs and configuration produce identical internal results with no shared request state; `yarn verify` passes.

## 11. HTTP response/error contracts and mapping — blocked by ASM-002 and ASM-008

- References: `REQ-025`, `REQ-026`, `REQ-034`, `REQ-035`; `AC-025`, `AC-027`, `AC-030`.
- Depends on: Tasks 1 and 10 plus approved public contracts.
- Scope: create Zod success/error schemas and a pure mapper from customer plus core result.
- Non-scope: inventing calculated field names, positive approval values, monetary serialization, or error representation.
- Tests: mapper output exactly satisfies the approved schemas, includes every preserved property from accepted customer input, and includes D's `approved: false`.
- Documentation: record the approved public contract in a new ADR only if the decision is materially architectural, and resolve the relevant assumptions.
- Blocking assumptions: `ASM-002` and `ASM-008`.
- Done: no response detail exists only as an Express implementation convention, accepted additional customer properties survive enrichment, and `yarn verify` passes.

## 12. Express classification endpoint — blocked by Task 11

- References: `REQ-025`–`REQ-027`, `REQ-034`, `REQ-035`; `AC-025`–`AC-027`, `AC-030`.
- Depends on: Task 11.
- Scope: inject the classifier into `createApp`, add `POST /customers/classify`, validate the body, map the response, handle malformed/invalid requests, and load rules once in the composition root.
- Non-scope: persistence, authentication, CORS, or request caching.
- Tests: approved valid response, preservation of accepted additional properties, each invalid/missing-field family, malformed JSON as approved, two independent calls, and repeated identifiers.
- Documentation: update README endpoint usage and current architecture.
- Blocking assumptions: transitively `ASM-002`, `ASM-007`, and `ASM-008`.
- Done: exact approved HTTP contracts pass through Supertest while health/docs behavior remains unchanged; `yarn verify` passes.

## 13. OpenAPI and contract integration — blocked by Task 12

- References: `REQ-001`, `REQ-025`, `REQ-026`, `REQ-034`, `REQ-035`; `AC-025`, `AC-027`, `AC-030`, `AC-033`.
- Depends on: Task 12.
- Scope: register the classification operation using the same request/response/error Zod schemas and verify generated OpenAPI.
- Non-scope: manually duplicated schemas or unrelated API expansion.
- Tests: `/openapi.json` contains the path, method, request body, approved statuses, and reusable schemas consistent with runtime validation.
- Documentation: OpenAPI becomes the public contract; README links remain current.
- Blocking assumptions: transitively `ASM-002`, `ASM-007`, and `ASM-008`.
- Done: runtime and documented contracts derive from the same Zod definitions; `yarn verify` passes.

## 14. Official six-sample verification — blocked by ASM-001

- References: `REQ-026`, `REQ-034`, `REQ-036`; `AC-028`, `AC-030`.
- Depends on: Task 12 and receipt of the official fixture/output contract.
- Scope: preserve the supplied fixture verbatim and add parameterized exact-response integration tests.
- Non-scope: fabricating, reverse-engineering, or relabeling spec-derived scenarios as official.
- Tests: all six official requests deep-equal their corresponding expected outputs.
- Documentation: mark `ASM-001` and related assumptions resolved and identify fixture provenance.
- Blocking assumptions: `ASM-001`, `ASM-002`, and the dependencies of Task 12.
- Done: all six tests execute through the real HTTP stack and match exactly; `yarn verify` passes.

## 15. Delivery documentation and final audit

- References: `REQ-028`, `REQ-037`–`REQ-042`; `AC-029`–`AC-033`.
- Depends on: all implementable tasks; full completion also depends on Tasks 9 and 11–14.
- Scope: update README/current architecture, curate meaningful AI-journey additions, verify single-command testing, and review the complete diff adversarially.
- Non-scope: rewriting historical ADRs or unrelated user-authored documentation.
- Tests: `yarn test` runs the entire suite once; final `yarn verify`; inspect configuration coverage, boundary coverage, schema reuse, statelessness, and documentation drift.
- Documentation: preserve existing user changes and remove placeholder/duplicate scaffolding only where safely superseded.
- Blocking assumptions: all unresolved assumptions attached to preceding tasks.
- Done: verification passes, documentation satisfies `REQ-038`–`REQ-042`, and no blocked criterion is claimed complete while its assumption remains unresolved.

## Dependency summary

```text
T1 → T2 → T3 → T4
             ├→ T5
             └→ T7 → T8 → [ASM-007 resolution] → T9
      └→ T6

T4 + T5 + T6 + T7 + T9 → T10
T1 + T10 + [ASM-002/ASM-008 resolution] → T11 → T12 → T13
T12 + [ASM-001 artifact] → T14
all completed work → T15
```
