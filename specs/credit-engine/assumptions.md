# Credit Engine Assumptions and Interpretations

This file records only source gaps or interpretations that materially affect challenge behavior. It must not be used to invent requirements absent from the challenge.

## ASM-001 — Missing official sample fixture

The challenge references an `expected-output.json` containing six sample customers, but that artifact was not included in the supplied material or repository.

### Effect

- `REQ-036` and `AC-028` remain blocked.
- Do not fabricate the official fixture or claim that locally derived cases are the six official samples.
- Any local fixture or scenario must be labeled **spec-derived**.

## ASM-002 — Missing output contract

The challenge requires the endpoint to return the customer enriched with all calculated fields from an “output contract”, but no output schema, field list, calculated-field names/types, or official response example was supplied.

The source explicitly names `approved` for `CLUSTER_D` and `approved_limit` in the formula, but it does not define the complete response or approval semantics for the other clusters.

### Effect

- `REQ-026`, `REQ-034`, `AC-025`, and `AC-028` remain blocked where they require the exact output contract.
- Do not invent an enriched response shape or monetary serialization.
- Core classification, income, and limit rules can still be specified and tested independently of the missing response contract.

## ASM-003 — Inclusive cluster age ranges

The cluster table writes the age ranges as `25–60` and `18–65` without separate comparison operators.

### Approved interpretation

- `CLUSTER_A`: `25 <= age <= 60`.
- `CLUSTER_B`: `18 <= age <= 65`.

This interpretation is not blocking.

## ASM-004 — Independent debt fields

The source does not define a consistency constraint between `has_market_debt` and `market_debt_types`.

### Approved interpretation

- Evaluate `has_market_debt` only where an explicit rule references it.
- Evaluate `market_debt_types` only where an explicit rule references it.
- Do not reject or normalize a customer merely because the two fields appear inconsistent.

## ASM-005 — Descriptive customer identifier

The customer schema describes `id` as a “Unique identifier”, while the API is explicitly stateless and persists nothing between calls.

### Approved interpretation

Treat `id` as the identifier supplied with the current record. Do not infer global or cross-request uniqueness enforcement.

## ASM-006 — Single default-debt penalty activation

The source defines one `DEFAULT_DEBT_PENALTY` whose trigger is `credit_default` **or** `loan_default` in `market_debt_types` and whose effect is `×0.5`.

### Approved interpretation

The rule activates once when either or both default debt types are present. The two values are not independent penalty applications, and the factor is not stacked.

When the rule does not trigger, `penalty_factor` is the multiplicative identity `1.0` required to evaluate the published formula.

## ASM-007 — Rounding midpoint semantics

The source requires `round_to_nearest_100` but does not define how exact midpoints are resolved.

### Effect

- Acceptance criteria use only non-midpoint values whose nearest hundred is unambiguous.
- Exact midpoint cases remain unresolved pending a human design decision.
- Do not encode half-up, half-even, or another midpoint policy as a challenge requirement.

## ASM-008 — Exact HTTP success and error contract

The source specifies the route and requires appropriate errors for invalid or missing fields, but it does not define success status codes, error status codes, error-body shape, or malformed-body behavior.

### Effect

- `AC-025` is blocked for the exact success contract by this assumption and `ASM-002`.
- `AC-027` is blocked for exact error status and body assertions.
- These details require a later human design decision and must not be presented as source requirements.

## ASM-009 — Customer-schema interpretation

The source presents one customer schema and later requires integration tests for invalid or missing fields. It writes location properties with dotted names.

### Approved interpretation

- Treat every listed customer field as part of the supplied request schema and a missing listed field as invalid for the source-required integration coverage.
- Treat `location.city`, `location.state`, and `location.region` as properties of a nested `location` object.
- Enforce only constraints stated by the source: declared types, the score range, the region values, and the five valid market-debt types.
- Do not invent additional constraints such as a state enum, a general age range, non-empty-string rules, or cross-field consistency validation.
