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

- References: `REQ-002`, `REQ-008`–`REQ-020`, `REQ-024`; relevant portions of `AC-012`, `AC-018`, `AC-025`, and `AC-033`.
- Depends on: Task 1.
- Scope: add the JSON representation, Zod schema, parser, startup loader, invariants, and exact-value tests.
- Non-scope: condition evaluation, hot reload, environment-selected files, or business calculation.
- Tests: approved configuration parses; exact clusters, approval decisions, keywords, matching operators, multipliers, matrix, and penalty values match the specification and approved fallback; only the executive acronyms identified by `ASM-010` use `containsStandaloneTermCaseInsensitive`; malformed conditions, duplicate identities/priorities, missing fallbacks, and incomplete matrix data fail.
- Documentation: replace the placeholder rule README and update the current-state architecture flow.
- Blocking assumptions: none; configure approved decisions under the local fallback in `ASM-002`.
- Done: configuration loads deterministically before request handling without embedding published rule values in evaluator code; `yarn verify` passes.

## 3. Generic condition evaluator — unblocked

- References: `REQ-002`, `REQ-007`, `REQ-012`, `REQ-013`, `REQ-024`; relevant portions of `AC-011`, `AC-012`, `AC-017`, `AC-020`, and `AC-033`.
- Depends on: Task 2.
- Scope: implement pure evaluation of the approved condition union and all-of groups, including generic `containsAnySubstringCaseInsensitive` and `containsStandaloneTermCaseInsensitive` string operators.
- Non-scope: embedding executive acronym values or the `ASM-010` category decision in evaluator code, arbitrary field paths, expression parsing, dynamic code, regex configuration, tokenization frameworks, OR trees, future operators, or a generalized text-rule engine.
- Tests: every operator, inclusive ranges, both array operators, `always`, and multi-condition conjunction; ordinary case-insensitive substring matching remains independently supported; standalone-term matching is case-insensitive; `COO`, `COO Brazil`, `coo`, `(COO)`, `ex-COO`, `COO/CTO`, and `COO_Brazil` match, while `Coordinator`, `myCOO`, `COO2`, and `COOOperations` do not match the standalone term `COO`.
- Documentation: no change beyond architecture if the final shape differs from Task 2.
- Blocking assumptions: none; `ASM-010` defines standalone boundaries and approves the generic behavior, while configuration determines which keywords use it.
- Done: all configured operators behave deterministically and evaluator branches contain no published thresholds, keywords, or monetary values; `yarn verify` passes.

## 4. Cluster classification — unblocked

- References: `REQ-007`–`REQ-011`, `REQ-029`; `AC-004`–`AC-011`, relevant portions of `AC-024`, `AC-025`, and `AC-029`.
- Depends on: Task 3.
- Scope: select the first matching configured cluster by priority.
- Non-scope: job, income, penalty, limit, or HTTP behavior.
- Tests: every threshold and age boundary, default-debt exclusion from B, C regardless of debt/age, D fallback, first-match priority, and configured approval decisions (`true` for A–C and `false` for D).
- Documentation: none.
- Blocking assumptions: none; inclusive ages follow `ASM-003`, debt fields remain independent under `ASM-004`, and approved decisions follow the local fallback in `ASM-002`.
- Done: selection exposes the configured code, label, limits, and approved decision metadata (`true` for A–C and `false` for D under `ASM-002`); `yarn verify` passes.

## 5. Job-category classification — unblocked

- References: `REQ-012`–`REQ-018`, `REQ-030`; `AC-012`–`AC-017`, `AC-029`.
- Depends on: Task 3.
- Scope: select the first matching configured category by priority, applying the approved acronym matching interpretation in `ASM-010`.
- Non-scope: fuzzy matching, localization, or matching policies beyond the approved source rules and `ASM-010`.
- Tests: every published keyword, mixed-case matching, all standalone-term boundary cases in `ASM-010`, `Coordinator`, `Senior Coordinator`, `OTHER`, and the specified multi-category priority case.
- Documentation: none.
- Blocking assumptions: none; follow `ASM-010`.
- Done: behavior is configuration-backed, case-insensitive, priority-driven, preserves ordinary substring matching, applies standalone-term matching to executive acronyms, and `yarn verify` passes.

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
- Non-scope: performing final nearest-hundred rounding or presenting a final approved limit.
- Tests: base formula, penalty-before-cap, capped and uncapped examples.
- Documentation: none beyond task traceability; the approved final rounding policy is recorded in `ASM-007` and belongs to Task 9.
- Blocking assumptions: none.
- Done: the function deterministically produces the capped pre-round value for Task 9; `yarn verify` passes.

## 9. Nearest-hundred rounding and final limit — unblocked

- References: `REQ-021`, `REQ-022`, `REQ-031`; `AC-019`, `AC-021`–`AC-024`, `AC-029`.
- Depends on: Task 8.
- Scope: implement nearest-100 rounding after capping, with nonnegative exact midpoint ties rounding upward under `ASM-007`, and compose the final limit function.
- Non-scope: half-even, downward-tie, or negative-amount policies outside the approved nonnegative monetary domain.
- Tests: `10,149 → 10,100`, `10,151 → 10,200`, `1,750 → 1,800`, `3,750 → 3,800`, D always zero, and real rule combinations that produce `1,750` or `3,750` before rounding.
- Documentation: none beyond task traceability; the human-approved interpretation is recorded in `ASM-007` and does not require an ADR.
- Blocking assumptions: none; follow resolved `ASM-007`.
- Done: all nonnegative monetary inputs, including exact midpoints, have approved deterministic behavior; `yarn verify` passes.

## 10. Core classification use case — unblocked

- References: `REQ-001`, `REQ-007`, `REQ-019`–`REQ-024`, `REQ-027`; relevant portions of `AC-024`, `AC-025`, and `AC-033`.
- Depends on: Tasks 4–9.
- Scope: coordinate cluster, job, income, penalty, final-limit, and approved-decision values using validated rules; return an internal result without mutating input.
- Non-scope: choosing external field names, serialization, status codes, or error bodies.
- Tests: spec-derived end-to-end core cases, priority interactions, default penalty, cap, approved decisions for A–D, D denial, and repeated independent calls.
- Documentation: update architecture to show the implemented use-case boundary.
- Blocking assumptions: none; Task 9 follows resolved `ASM-007`.
- Done: identical inputs and configuration produce identical internal results with no shared request state; `yarn verify` passes.

## 11. HTTP response/error contracts and mapping — unblocked

- References: `REQ-019`, `REQ-021`, `REQ-025`, `REQ-026`, `REQ-034`, `REQ-035`; `AC-025`, `AC-027`, `AC-030`, `AC-034`.
- Depends on: Tasks 1 and 10.
- Scope: create Zod success/error schemas and a pure mapper from customer plus core result using the flat fallback response in `ASM-002` and shared error envelope in `ASM-008`.
- Non-scope: adding success envelopes, internal calculation metadata, formatted currency strings, integer minor units, raw Zod errors, or response fields outside the approved contracts.
- Tests: mapper output exactly satisfies the approved schemas; preserves every property from accepted customer input; adds exactly `cluster_id`, `cluster_name`, `job_category`, `monthly_income`, `approved`, and `approved_limit`; uses `approved = true` for A–C and `false` for D; serializes monetary fields as JSON numbers in BRL units; and maps stable validation and malformed-JSON errors without leaking unnecessary Zod-specific structure.
- Documentation: document the approved public contract in current API documentation; no ADR is required unless implementation introduces a separate material architectural decision.
- Blocking assumptions: none; follow resolved-for-implementation `ASM-002` and resolved `ASM-008`.
- Done: no response detail exists only as an Express implementation convention, accepted additional customer properties survive enrichment, and `yarn verify` passes.

## 12. Express classification endpoint — unblocked

- References: `REQ-019`, `REQ-021`, `REQ-025`–`REQ-027`, `REQ-034`, `REQ-035`; `AC-025`–`AC-027`, `AC-030`, `AC-034`.
- Depends on: Task 11.
- Scope: inject the classifier into `createApp`, add `POST /customers/classify`, validate the body, map the response, handle malformed/invalid requests, and load rules once in the composition root.
- Non-scope: persistence, authentication, CORS, or request caching.
- Tests: HTTP `200 OK` with the enriched object directly for valid input; preservation of accepted additional properties; HTTP `400 Bad Request` with the `VALIDATION_ERROR` envelope for each invalid/missing-field family; HTTP `400 Bad Request` with the `MALFORMED_JSON` envelope for malformed JSON; two independent calls; and repeated identifiers.
- Documentation: update README endpoint usage and current architecture.
- Blocking assumptions: none; dependencies follow the resolved local contracts in `ASM-002`, `ASM-007`, and `ASM-008`.
- Done: exact approved HTTP contracts pass through Supertest while health/docs behavior remains unchanged; `yarn verify` passes.

## 13. OpenAPI and contract integration — unblocked

- References: `REQ-001`, `REQ-019`, `REQ-021`, `REQ-025`, `REQ-026`, `REQ-034`, `REQ-035`; `AC-025`, `AC-027`, `AC-030`, `AC-033`, `AC-034`.
- Depends on: Task 12.
- Scope: register the classification operation using the same request/response/error Zod schemas and verify generated OpenAPI.
- Non-scope: manually duplicated schemas or unrelated API expansion.
- Tests: `/openapi.json` contains the path, method, request body, HTTP `200` success response, HTTP `400` shared error envelope, and reusable schemas consistent with runtime validation.
- Documentation: OpenAPI becomes the public contract; README links remain current.
- Blocking assumptions: none; dependencies follow the resolved local contracts in `ASM-002`, `ASM-007`, and `ASM-008`.
- Done: runtime and documented contracts derive from the same Zod definitions; `yarn verify` passes.

## 14. Official six-sample verification — blocked by ASM-001

- References: `REQ-026`, `REQ-034`, `REQ-036`; `AC-028`, `AC-030`.
- Depends on: Task 12 and receipt of the official fixture.
- Scope: preserve the supplied fixture verbatim and add parameterized exact-response integration tests.
- Non-scope: fabricating, reverse-engineering, or relabeling spec-derived scenarios as official.
- Tests: all six official requests deep-equal their corresponding expected outputs.
- Documentation: mark `ASM-001` resolved and identify fixture provenance.
- Blocking assumptions: `ASM-001` only.
- Done: all six tests execute through the real HTTP stack and match exactly; `yarn verify` passes.

## 15. Delivery documentation and final audit

- References: `REQ-028`, `REQ-037`–`REQ-042`; `AC-029`–`AC-034`.
- Depends on: all implementable tasks; full completion of the source-required official sample verification also depends on Task 14.
- Scope: update README/current architecture, curate meaningful AI-journey additions, verify single-command testing, and review the complete diff adversarially.
- Non-scope: rewriting historical ADRs or unrelated user-authored documentation.
- Tests: `yarn test` runs the entire suite once; final `yarn verify`; inspect configuration coverage, boundary coverage, schema reuse, statelessness, and documentation drift.
- Documentation: preserve existing user changes and remove placeholder/duplicate scaffolding only where safely superseded.
- Blocking assumptions: `ASM-001` only for Task 14 and the official six-sample obligation.
- Done: verification passes, documentation satisfies `REQ-038`–`REQ-042`, and no blocked criterion is claimed complete while its assumption remains unresolved.

## Dependency summary

```text
T1 → T2 → T3 → T4
             ├→ T5
             └→ T7 → T8 → T9
      └→ T6

T4 + T5 + T6 + T7 + T9 → T10
T1 + T10 → T11 → T12 → T13
T12 + [ASM-001 artifact] → T14
all completed work → T15
```
