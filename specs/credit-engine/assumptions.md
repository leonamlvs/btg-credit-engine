# Credit Engine Assumptions and Interpretations

This file records only source gaps or interpretations that materially affect challenge behavior. It must not be used to invent requirements absent from the challenge.

## ASM-001 — Missing official sample fixture

The challenge references an `expected-output.json` containing six sample customers, but that artifact was not included in the supplied material or repository.

### Status

External blocker — unresolved.

### Effect

- `REQ-036` and `AC-028` remain blocked.
- Do not fabricate the official fixture or claim that locally derived cases are the six official samples.
- Any local fixture or scenario must be labeled **spec-derived**.

## ASM-002 — Missing official output contract

The challenge requires the endpoint to return the customer enriched with all calculated fields from an “output contract”, but no output schema, field list, calculated-field names/types, or official response example was supplied.

The source explicitly names `approved` for `CLUSTER_D` and `approved_limit` in the formula, but it does not define the complete response or approval semantics for the other clusters.

### Status

Resolved for implementation by the human-approved local fallback below. The referenced official contract remains unavailable, so the fallback must be reconciled if the official artifact is later supplied.

### Approved local fallback

- `approved = true` for `CLUSTER_A`, `CLUSTER_B`, and `CLUSTER_C`.
- `approved = false` for `CLUSTER_D`.
- Return the original accepted customer object, enriched at the top level with exactly these calculated fields:
  - `cluster_id`: a JSON string containing the selected cluster code;
  - `cluster_name`: a JSON string containing the selected cluster display name;
  - `job_category`: a JSON string containing the selected job-category code;
  - `monthly_income`: a JSON number expressed directly in BRL units;
  - `approved`: a JSON boolean;
  - `approved_limit`: a JSON number expressed directly in BRL units.
- Keep the response flat. Do not wrap it in a success envelope.
- Do not expose internal calculation or rule-engine metadata such as `base_limit`, `cluster_cap`, `job_multiplier`, `penalty_factor`, matched conditions, or internal matched rule IDs.
- Monetary values use BRL major units: `6500` represents R$ 6.500,00 and `6500.25` represents R$ 6.500,25. Do not use formatted currency strings or integer minor units, and do not require trailing decimal zeroes in JSON.

### Effect

- `REQ-026`, `REQ-034`, and `AC-025` are unblocked for implementation against the approved fallback.
- The fallback does not claim to reproduce the unavailable official output contract.
- `AC-028` remains blocked only by `ASM-001`; do not fabricate the official fixture or its six expected responses.

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

### Approved interpretation

- For nonnegative monetary amounts, exact midpoint ties round upward to the next hundred.
- `1,750` rounds to `1,800`.
- `3,750` rounds to `3,800`.

This resolves the ambiguity for implementation. It is a human-approved interpretation, not a rule stated by the challenge.

## ASM-008 — HTTP success and error contract

The source specifies the route and requires appropriate errors for invalid or missing fields, but it does not define success status codes, error status codes, error-body shape, or malformed-body behavior.

### Approved interpretation

- A successful `POST /customers/classify` returns HTTP `200 OK` with the enriched customer object directly as the response body. It does not return `201 Created`, a generic success envelope, or a creation message.
- Missing required fields, wrong declared types, invalid enum values, and invalid score ranges return HTTP `400 Bad Request`.
- Schema-validation failures use this application-owned public envelope:

  ```json
  {
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "Request validation failed",
      "details": [
        {
          "path": "<field path>",
          "message": "<issue description>"
        }
      ]
    }
  }
  ```

- Validation details expose stable field paths and human-readable messages derived from validation failures without exposing unnecessary Zod-specific structure.
- Malformed JSON returns HTTP `400 Bad Request` using the same public envelope schema:

  ```json
  {
    "error": {
      "code": "MALFORMED_JSON",
      "message": "Request body contains invalid JSON",
      "details": []
    }
  }
  ```

- For malformed JSON, `details` remains present and is always an empty array. It must not expose Express, JSON-parser, or other parser-internal information.
- Malformed JSON does not introduce a separate error-response schema.

This resolves the HTTP ambiguity for implementation. These values are human-approved interpretations, not source-defined status or response details.

## ASM-009 — Customer-schema interpretation

The source presents one customer schema and later requires integration tests for invalid or missing fields. It writes location properties with dotted names.

### Approved interpretation

- Treat every listed customer field as part of the supplied request schema and a missing listed field as invalid for the source-required integration coverage.
- Treat `location.city`, `location.state`, and `location.region` as properties of a nested `location` object.
- Enforce only constraints stated by the source: declared types, the score range, the region values, and the five valid market-debt types.
- Do not invent additional constraints such as a state enum, a general age range, non-empty-string rules, or cross-field consistency validation.

## ASM-010 — Acronym keyword matching

The source requires case-insensitive substring matching and lists `COO`
as an `EXECUTIVE` keyword while also listing `Coordinator` as a
`SENIOR_PROFESSIONAL` keyword.

Literal substring evaluation would cause `Coordinator` to match `COO`
at the higher executive priority, making the explicit `Coordinator`
senior keyword ineffective.

### Approved interpretation

Executive acronym keywords (`CEO`, `CFO`, `CTO`, `COO`, `CIO`, `CMO`,
and `VP`) match only as standalone terms.

A standalone term is not immediately adjacent on either side to a Unicode or
ASCII letter or digit. Whitespace, punctuation, and underscores delimit the
term.

Consequently, `COO`, `COO Brazil`, `coo`, `(COO)`, `ex-COO`, `COO/CTO`,
and `COO_Brazil` match the standalone executive acronym. `Coordinator`,
`myCOO`, `COO2`, and `COOOperations` do not match the standalone term `COO`.

Non-acronym keywords continue to use the source-defined
case-insensitive substring behavior.

Therefore `Coordinator` does not match `COO` and remains eligible for
`SENIOR_PROFESSIONAL`.

Category priority remains unchanged.
