# Credit Engine Requirements

## Status and provenance

This document is the operational specification extracted from the recruiter-provided **BTG Pactual Credit Engine — Backend Challenge** PDF. Page references below refer to that seven-page source.

Requirements state what the challenge requires. Interpretations and missing source material are recorded separately in `assumptions.md`. Sequential identifiers are stable and must not be renumbered when future requirements are added.

## Functional Requirements

### System purpose and rule representation

#### REQ-001 — Credit-engine capabilities

The system must provide a REST API that classifies customers into risk clusters, calculates personalised credit limits, and estimates monthly income.

Source: PDF p. 1, introduction.

#### REQ-002 — Data-driven classification rules

The classification engine's business rules must be data-driven and representable as configuration rather than buried in logic.

Source: PDF p. 1, introduction; p. 2, “Business Rules” design note.

### Customer input

#### REQ-003 — Customer schema

The customer object must contain the fields and types shown in the source schema:

| Field               | Type     | Description                                       |
| ------------------- | -------- | ------------------------------------------------- |
| `id`                | string   | Unique identifier                                 |
| `name`              | string   | Full name                                         |
| `age`               | integer  | Age in years                                      |
| `score`             | integer  | Credit bureau score                               |
| `has_market_debt`   | boolean  | Whether the customer has any recorded market debt |
| `market_debt_types` | string[] | Active debt types                                 |
| `location.city`     | string   | City of residence                                 |
| `location.state`    | string   | State abbreviation, such as `SP` or `RJ`          |
| `location.region`   | string   | Customer region                                   |
| `job_title`         | string   | Free-text job title                               |

Source: PDF p. 1, “Input Data > Customer Schema”. See `ASM-009` for the approved structural interpretation.

#### REQ-004 — Score range

`score` must be within the inclusive range `0–1000`.

Source: PDF p. 1, “Customer Schema”.

#### REQ-005 — Region values

`location.region` must use one of these values:

- `Norte`
- `Nordeste`
- `Centro-Oeste`
- `Sudeste`
- `Sul`

Source: PDF p. 1, “Customer Schema”.

#### REQ-006 — Valid market-debt types

Every value in `market_debt_types` must be one of the five source-defined values:

| Value            | Meaning                              |
| ---------------- | ------------------------------------ |
| `credit_card`    | Active credit card (non-defaulted)   |
| `personal_loan`  | Active personal loan (non-defaulted) |
| `mortgage`       | Mortgage (non-defaulted)             |
| `credit_default` | Credit card in collections           |
| `loan_default`   | Loan in collections                  |

Source: PDF p. 2, “Valid market_debt_types values”.

### Customer clusters

#### REQ-007 — Cluster evaluation order

Clusters must be evaluated in priority order, and the first cluster whose conditions are fully met must be assigned.

Source: PDF p. 2, “1. Customer Clusters”.

#### REQ-008 — CLUSTER_A

Priority 1 `CLUSTER_A` (`Diamond`) applies when all of these conditions are met:

- `score >= 700`;
- `25 <= age <= 60`;
- `has_market_debt == false`.

Its base limit is `R$ 50,000` and its cap is `R$ 100,000`.

Source: PDF p. 2, cluster table. See `ASM-003` for the inclusive-age interpretation.

#### REQ-009 — CLUSTER_B

Priority 2 `CLUSTER_B` (`Gold`) applies when all of these conditions are met:

- `score >= 500`;
- `18 <= age <= 65`;
- neither `credit_default` nor `loan_default` is present in `market_debt_types`.

Its base limit is `R$ 20,000` and its cap is `R$ 40,000`.

Source: PDF p. 2, cluster table. See `ASM-003` for the inclusive-age interpretation.

#### REQ-010 — CLUSTER_C

Priority 3 `CLUSTER_C` (`Silver`) applies when `score >= 300`. It has no age or debt condition. Its base limit is `R$ 5,000` and its cap is `R$ 10,000`.

Source: PDF p. 2, cluster table.

#### REQ-011 — CLUSTER_D

Priority 4 `CLUSTER_D` (`Bronze`) is the catch-all cluster. Its base limit and cap are both `R$ 0`, and the customer is denied with `approved = false`.

Source: PDF p. 3, cluster table; p. 5, required unit-test behavior.

### Job-title categories

#### REQ-012 — Case-insensitive substring matching

Job-title keywords must be matched case-insensitively anywhere in the free-text `job_title`.

Source: PDF p. 3, “2. Job Title Categories”.

#### REQ-013 — Job-category evaluation order

Job categories must be evaluated top-down in priority order, and the first matching category must win.

Source: PDF p. 3, “2. Job Title Categories”.

#### REQ-014 — EXECUTIVE category

Priority 1 `EXECUTIVE` has multiplier `2.0` and these keywords, in the terminology and order supplied:

`CEO`, `CFO`, `CTO`, `COO`, `CIO`, `CMO`, `Chief`, `President`, `Vice President`, `VP`, `Director`.

Source: PDF p. 3, job-title category table.

#### REQ-015 — SENIOR_PROFESSIONAL category

Priority 2 `SENIOR_PROFESSIONAL` has multiplier `1.5` and these keywords:

`Senior`, `Lead`, `Manager`, `Coordinator`, `Supervisor`, `Principal`.

Source: PDF p. 3, job-title category table.

#### REQ-016 — MID_PROFESSIONAL category

Priority 3 `MID_PROFESSIONAL` has multiplier `1.0` and these keywords:

`Engineer`, `Analyst`, `Developer`, `Specialist`, `Designer`, `Accountant`, `Consultant`, `Architect`.

Source: PDF p. 3, job-title category table.

#### REQ-017 — JUNIOR_PROFESSIONAL category

Priority 4 `JUNIOR_PROFESSIONAL` has multiplier `0.7` and these keywords:

`Junior`, `Trainee`, `Intern`, `Apprentice`, `Assistant`, `Associate`.

Source: PDF p. 3, job-title category table.

#### REQ-018 — OTHER category

Priority 5 `OTHER` has multiplier `0.8` and applies when no keyword from a higher-priority category matches.

Source: PDF p. 3, job-title category table.

### Monthly income

#### REQ-019 — Monthly-income derivation

Monthly income must be derived from the assigned cluster and job category. Values are in BRL.

Source: PDF p. 3, “3. Monthly Income”.

#### REQ-020 — Monthly-income matrix

The monthly-income lookup must use this exact matrix:

| Cluster     | `EXECUTIVE` | `SENIOR_PROFESSIONAL` | `MID_PROFESSIONAL` | `JUNIOR_PROFESSIONAL` | `OTHER` |
| ----------- | ----------: | --------------------: | -----------------: | --------------------: | ------: |
| `CLUSTER_A` |      30,000 |                20,000 |             12,000 |                 8,000 |  10,000 |
| `CLUSTER_B` |      20,000 |                15,000 |              8,000 |                 5,000 |   6,500 |
| `CLUSTER_C` |      10,000 |                 7,000 |              5,000 |                 3,000 |   4,000 |
| `CLUSTER_D` |           0 |                     0 |                  0 |                     0 |       0 |

Source: PDF p. 3, monthly-income table.

### Credit limit and penalties

#### REQ-021 — Credit-limit formula

The approved limit must be calculated in this exact order:

```text
approved_limit = round_to_nearest_100(
  min( base_limit × job_multiplier × penalty_factor, cluster_cap )
)
```

Source: PDF p. 4, “4. Credit Limit Formula”. See `ASM-007` for unresolved midpoint behavior.

#### REQ-022 — CLUSTER_D approved limit

`CLUSTER_D` must always yield `approved_limit = 0`.

Source: PDF p. 4, “4. Credit Limit Formula”.

#### REQ-023 — Penalty position

The penalty must be applied after the job multiplier and before the cluster cap.

Source: PDF p. 4, “5. Penalty Rules”.

#### REQ-024 — DEFAULT_DEBT_PENALTY

Priority 1 `DEFAULT_DEBT_PENALTY` must apply an effect of `×0.5` when `credit_default` or `loan_default` is present in `market_debt_types`.

Source: PDF p. 4, penalty-rule table. See `ASM-006` for the single-trigger interpretation.

### HTTP contract

#### REQ-025 — Classification endpoint

`POST /customers/classify` must accept a customer object in the request body and classify it.

Source: PDF p. 4, “API”.

#### REQ-026 — Enriched response

The endpoint must return the same customer object enriched with all calculated fields from the output contract.

Source: PDF p. 4, “API”. The referenced output contract is missing; see blocking assumption `ASM-002`.

#### REQ-027 — Stateless operation

The application must be stateless, and nothing may be persisted between calls.

Source: PDF p. 4, “API”.

## Testing Requirements

#### REQ-028 — Unit and integration tests

Both unit and integration tests are required.

Source: PDF p. 5, “Testing (Required)”.

#### REQ-029 — Unit tests for clusters

Unit tests must cover assignment to every cluster, including boundary conditions such as a score exactly at a threshold.

Source: PDF p. 5, “Testing (Required)”.

#### REQ-030 — Unit tests for job categories

Unit tests must cover job-category matching, including case-insensitivity and priority ordering.

Source: PDF p. 5, “Testing (Required)”.

#### REQ-031 — Unit tests for credit limits

Unit tests must cover the base formula, penalty application, cap enforcement, and `round_to_nearest_100`.

Source: PDF p. 5, “Testing (Required)”.

#### REQ-032 — Unit tests for monthly income

Unit tests must cover the monthly-income lookup for every cluster × job-category combination.

Source: PDF p. 5, “Testing (Required)”.

#### REQ-033 — Unit test for denial

Unit tests must cover `CLUSTER_D` denial with `approved = false` and `approved_limit = 0`.

Source: PDF p. 5, “Testing (Required)”.

#### REQ-034 — Valid-request integration test

Integration tests must exercise the full request/response cycle and verify that `POST /customers/classify` with valid input returns the correct output contract.

Source: PDF p. 5, “Testing (Required)”. See blocking assumption `ASM-002`.

#### REQ-035 — Invalid-request integration tests

Integration tests must verify that `POST /customers/classify` with invalid or missing fields returns appropriate error responses.

Source: PDF p. 5, “Testing (Required)”. See `ASM-008` for the unresolved exact HTTP error contract.

#### REQ-036 — Official sample integration tests

Integration tests must verify that all six sample customers from `expected-output.json` produce the exact expected output.

Source: PDF p. 5, “Testing (Required)”. The referenced fixture is missing; see blocking assumption `ASM-001`.

#### REQ-037 — Single-command test execution

The test suite must be runnable with a single command.

Source: PDF p. 5, “Testing (Required)”.

## Delivery and Documentation Requirements

#### REQ-038 — AI-journey directory

The repository must include an `ai-journey/` directory documenting the AI-assisted process.

Source: PDF p. 6, “AI Journey (Required)”.

#### REQ-039 — AI-journey summary

`ai-journey/README.md` must briefly summarize which AI tools were used and for what purpose.

Source: PDF p. 6, “AI Journey (Required)”.

#### REQ-040 — Key prompts and iteration

`ai-journey/prompts.md` must document key prompts, what they produced, and how the result was iterated, focusing on interesting interactions rather than a full log.

Source: PDF p. 6, “AI Journey (Required)”.

#### REQ-041 — AI learnings

`ai-journey/learnings.md` must honestly reflect on what worked, what did not work, and what would be done differently.

Source: PDF pp. 6–7, “AI Journey (Required)”.

#### REQ-042 — Documentation depth and honesty

The AI-journey documentation must have meaningful depth and honesty.

Source: PDF p. 7, “AI Journey (Required)”.

## Non-normative evaluation context

The challenge says submissions are evaluated for problem solving, architecture, code quality, testing, documentation, and AI collaboration. Its example tools, prompts, snippets, and reflections illustrate the requested documentation; they are not additional functional requirements or prescribed implementation choices.
