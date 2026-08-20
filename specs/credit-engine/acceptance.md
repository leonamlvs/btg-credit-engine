# Credit Engine Acceptance Criteria

## Conventions

Each criterion traces to one or more requirements and identifies its verification level. Scenarios created from the published rules are labeled **spec-derived**; they are not the missing six official samples from `expected-output.json`.

## Customer input

### AC-001 — Customer schema

| Field               | Value                                                                                                       |
| ------------------- | ----------------------------------------------------------------------------------------------------------- |
| AC ID               | `AC-001`                                                                                                    |
| Scenario            | A customer supplies every field listed by `REQ-003`, with the declared type and a nested `location` object. |
| Expected result     | The object conforms to the supplied customer schema. No unstated validation constraint is applied.          |
| Traced REQ IDs      | `REQ-003`                                                                                                   |
| Verification level  | Unit contract test                                                                                          |
| Blocking assumption | None; interpretation recorded in `ASM-009`                                                                  |

### AC-002 — Score boundaries

| Field               | Value                                                                           |
| ------------------- | ------------------------------------------------------------------------------- |
| AC ID               | `AC-002`                                                                        |
| Scenario            | **Spec-derived:** validate customers with scores `0`, `1000`, `-1`, and `1001`. |
| Expected result     | `0` and `1000` satisfy the score range; `-1` and `1001` do not.                 |
| Traced REQ IDs      | `REQ-004`                                                                       |
| Verification level  | Unit contract test                                                              |
| Blocking assumption | None                                                                            |

### AC-003 — Region and market-debt enumerations

| Field               | Value                                                                                                                                                                                             |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC ID               | `AC-003`                                                                                                                                                                                          |
| Scenario            | **Spec-derived:** validate each of the five regions and each of `credit_card`, `personal_loan`, `mortgage`, `credit_default`, and `loan_default`; also validate an unlisted value for each field. |
| Expected result     | Every listed value satisfies its corresponding enumeration, and an unlisted value does not.                                                                                                       |
| Traced REQ IDs      | `REQ-005`, `REQ-006`                                                                                                                                                                              |
| Verification level  | Parameterized unit contract test                                                                                                                                                                  |
| Blocking assumption | None                                                                                                                                                                                              |

## Cluster assignment

### AC-004 — CLUSTER_A lower boundaries

| Field               | Value                                                                                                    |
| ------------------- | -------------------------------------------------------------------------------------------------------- |
| AC ID               | `AC-004`                                                                                                 |
| Scenario            | **Spec-derived:** a customer has `score = 700`, `age = 25`, and `has_market_debt = false`.               |
| Expected result     | The customer is assigned priority 1 `CLUSTER_A` (`Diamond`), with base limit `50,000` and cap `100,000`. |
| Traced REQ IDs      | `REQ-007`, `REQ-008`, `REQ-029`                                                                          |
| Verification level  | Unit classification test                                                                                 |
| Blocking assumption | None; inclusive-age interpretation recorded in `ASM-003`                                                 |

### AC-005 — CLUSTER_A upper and outside-age boundaries

| Field               | Value                                                                                                                  |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| AC ID               | `AC-005`                                                                                                               |
| Scenario            | **Spec-derived:** otherwise identical qualifying customers have ages `60`, `24`, and `61`, with no default debt types. |
| Expected result     | Age `60` qualifies for `CLUSTER_A`; ages `24` and `61` do not qualify for A and are evaluated against B next.          |
| Traced REQ IDs      | `REQ-007`, `REQ-008`, `REQ-009`, `REQ-029`                                                                             |
| Verification level  | Parameterized unit classification test                                                                                 |
| Blocking assumption | None; inclusive-age interpretation recorded in `ASM-003`                                                               |

### AC-006 — CLUSTER_B lower boundaries

| Field               | Value                                                                                                                  |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| AC ID               | `AC-006`                                                                                                               |
| Scenario            | **Spec-derived:** a customer has `score = 500`, `age = 18`, does not qualify for A, and has neither default debt type. |
| Expected result     | The customer is assigned priority 2 `CLUSTER_B` (`Gold`), with base limit `20,000` and cap `40,000`.                   |
| Traced REQ IDs      | `REQ-007`, `REQ-009`, `REQ-029`                                                                                        |
| Verification level  | Unit classification test                                                                                               |
| Blocking assumption | None; inclusive-age interpretation recorded in `ASM-003`                                                               |

### AC-007 — CLUSTER_B upper and outside boundaries

| Field               | Value                                                                                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| AC ID               | `AC-007`                                                                                                                                               |
| Scenario            | **Spec-derived:** customers that do not qualify for A have neither default debt type and exercise age `65`, age `17`, age `66`, and score `499`.       |
| Expected result     | Age `65` with score at least `500` qualifies for B; ages `17` and `66`, and score `499`, do not qualify for B and continue to lower-priority clusters. |
| Traced REQ IDs      | `REQ-007`, `REQ-009`, `REQ-010`, `REQ-029`                                                                                                             |
| Verification level  | Parameterized unit classification test                                                                                                                 |
| Blocking assumption | None; inclusive-age interpretation recorded in `ASM-003`                                                                                               |

### AC-008 — Default debt excludes CLUSTER_B

| Field               | Value                                                                                                                                                              |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| AC ID               | `AC-008`                                                                                                                                                           |
| Scenario            | **Spec-derived:** a customer meets B's score and age conditions, does not qualify for A, and has `credit_default`, `loan_default`, or both in `market_debt_types`. |
| Expected result     | The customer does not qualify for B and continues to the next priority.                                                                                            |
| Traced REQ IDs      | `REQ-007`, `REQ-009`, `REQ-029`                                                                                                                                    |
| Verification level  | Parameterized unit classification test                                                                                                                             |
| Blocking assumption | None                                                                                                                                                               |

### AC-009 — CLUSTER_C threshold

| Field               | Value                                                                                                                            |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| AC ID               | `AC-009`                                                                                                                         |
| Scenario            | **Spec-derived:** a customer has `score = 300` and does not meet A or B.                                                         |
| Expected result     | The customer is assigned priority 3 `CLUSTER_C` (`Silver`), with base limit `5,000` and cap `10,000`, regardless of age or debt. |
| Traced REQ IDs      | `REQ-007`, `REQ-010`, `REQ-029`                                                                                                  |
| Verification level  | Unit classification test                                                                                                         |
| Blocking assumption | None                                                                                                                             |

### AC-010 — CLUSTER_D catch-all

| Field               | Value                                                                                                            |
| ------------------- | ---------------------------------------------------------------------------------------------------------------- |
| AC ID               | `AC-010`                                                                                                         |
| Scenario            | **Spec-derived:** a customer has `score = 299` and therefore meets none of A, B, or C.                           |
| Expected result     | The customer is assigned priority 4 `CLUSTER_D` (`Bronze`), with base limit `0`, cap `0`, and a denied decision. |
| Traced REQ IDs      | `REQ-007`, `REQ-011`, `REQ-029`                                                                                  |
| Verification level  | Unit classification test                                                                                         |
| Blocking assumption | None                                                                                                             |

### AC-011 — First matching cluster wins

| Field               | Value                                                                                                                                        |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| AC ID               | `AC-011`                                                                                                                                     |
| Scenario            | **Spec-derived:** a customer satisfies all conditions for A and would also satisfy the less restrictive score and age conditions of B and C. |
| Expected result     | Evaluation stops at A, and `CLUSTER_A` is assigned.                                                                                          |
| Traced REQ IDs      | `REQ-007`, `REQ-008`, `REQ-009`, `REQ-010`, `REQ-029`                                                                                        |
| Verification level  | Unit classification test                                                                                                                     |
| Blocking assumption | None                                                                                                                                         |

## Job-title category

### AC-012 — EXECUTIVE matching

| Field               | Value                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC ID               | `AC-012`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Scenario            | **Spec-derived:** evaluate every published executive keyword. For the standalone acronym `COO`, include `COO`, `COO Brazil`, `coo`, `(COO)`, `ex-COO`, `COO/CTO`, `COO_Brazil`, `Coordinator`, `myCOO`, `COO2`, and `COOOperations`.                                                                                                                                                                                                                                                                                               |
| Expected result     | Every published executive keyword assigns priority 1 `EXECUTIVE` with multiplier `2.0` under its approved matching operator. `COO`, `COO Brazil`, `coo`, `(COO)`, `ex-COO`, `COO/CTO`, and `COO_Brazil` match case-insensitively because punctuation, whitespace, and underscores delimit the acronym. `Coordinator`, `myCOO`, `COO2`, and `COOOperations` do not match `COO` because an adjacent letter or digit prevents a standalone match. Non-acronym executive keywords retain ordinary case-insensitive substring matching. |
| Traced REQ IDs      | `REQ-012`, `REQ-013`, `REQ-014`, `REQ-030`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Verification level  | Parameterized unit job-category test                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Blocking assumption | None; approved standalone-term behavior recorded in `ASM-010`                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |

### AC-013 — SENIOR_PROFESSIONAL matching

| Field               | Value                                                                                                                                                                                                 |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC ID               | `AC-013`                                                                                                                                                                                              |
| Scenario            | **Spec-derived:** senior-professional keywords are matched case-insensitively with no higher-priority match under the approved matching policy. Cases include `Coordinator` and `Senior Coordinator`. |
| Expected result     | `Coordinator` and `Senior Coordinator` assign priority 2 `SENIOR_PROFESSIONAL` with multiplier `1.5`; `Coordinator` does not match the standalone executive acronym `COO`.                            |
| Traced REQ IDs      | `REQ-012`, `REQ-013`, `REQ-015`, `REQ-030`                                                                                                                                                            |
| Verification level  | Parameterized unit job-category test                                                                                                                                                                  |
| Blocking assumption | None; acronym matching interpretation recorded in `ASM-010`                                                                                                                                           |

### AC-014 — MID_PROFESSIONAL matching

| Field               | Value                                                                                                                                       |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| AC ID               | `AC-014`                                                                                                                                    |
| Scenario            | **Spec-derived:** each mid-professional keyword is embedded in a job title, including mixed-case variants, with no higher-priority keyword. |
| Expected result     | Every listed keyword assigns priority 3 `MID_PROFESSIONAL` with multiplier `1.0`.                                                           |
| Traced REQ IDs      | `REQ-012`, `REQ-013`, `REQ-016`, `REQ-030`                                                                                                  |
| Verification level  | Parameterized unit job-category test                                                                                                        |
| Blocking assumption | None                                                                                                                                        |

### AC-015 — JUNIOR_PROFESSIONAL matching

| Field               | Value                                                                                                                                          |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| AC ID               | `AC-015`                                                                                                                                       |
| Scenario            | **Spec-derived:** each junior-professional keyword is embedded in a job title, including mixed-case variants, with no higher-priority keyword. |
| Expected result     | Every listed keyword assigns priority 4 `JUNIOR_PROFESSIONAL` with multiplier `0.7`.                                                           |
| Traced REQ IDs      | `REQ-012`, `REQ-013`, `REQ-017`, `REQ-030`                                                                                                     |
| Verification level  | Parameterized unit job-category test                                                                                                           |
| Blocking assumption | None                                                                                                                                           |

### AC-016 — OTHER fallback

| Field               | Value                                                                   |
| ------------------- | ----------------------------------------------------------------------- |
| AC ID               | `AC-016`                                                                |
| Scenario            | **Spec-derived:** a job title contains none of the configured keywords. |
| Expected result     | Priority 5 `OTHER` is assigned with multiplier `0.8`.                   |
| Traced REQ IDs      | `REQ-013`, `REQ-018`, `REQ-030`                                         |
| Verification level  | Unit job-category test                                                  |
| Blocking assumption | None                                                                    |

### AC-017 — First matching job category wins

| Field               | Value                                                                                                                  |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| AC ID               | `AC-017`                                                                                                               |
| Scenario            | **Spec-derived:** `job_title` is `Assistant Manager to the Director`, matching junior, senior, and executive keywords. |
| Expected result     | `EXECUTIVE` wins because it has the highest priority, regardless of keyword position in the title.                     |
| Traced REQ IDs      | `REQ-012`, `REQ-013`, `REQ-014`, `REQ-015`, `REQ-017`, `REQ-030`                                                       |
| Verification level  | Unit job-category priority test                                                                                        |
| Blocking assumption | None                                                                                                                   |

## Monthly income

### AC-018 — Complete monthly-income matrix

| Field               | Value                                          |
| ------------------- | ---------------------------------------------- |
| AC ID               | `AC-018`                                       |
| Scenario            | Evaluate every cluster × job-category pair.    |
| Expected result     | The 20 results exactly match the matrix below. |
| Traced REQ IDs      | `REQ-019`, `REQ-020`, `REQ-032`                |
| Verification level  | Parameterized unit income-lookup test          |
| Blocking assumption | None                                           |

| Cluster     | `EXECUTIVE` | `SENIOR_PROFESSIONAL` | `MID_PROFESSIONAL` | `JUNIOR_PROFESSIONAL` | `OTHER` |
| ----------- | ----------: | --------------------: | -----------------: | --------------------: | ------: |
| `CLUSTER_A` |      30,000 |                20,000 |             12,000 |                 8,000 |  10,000 |
| `CLUSTER_B` |      20,000 |                15,000 |              8,000 |                 5,000 |   6,500 |
| `CLUSTER_C` |      10,000 |                 7,000 |              5,000 |                 3,000 |   4,000 |
| `CLUSTER_D` |           0 |                     0 |                  0 |                     0 |       0 |

## Credit limit and penalty

### AC-019 — Base formula without a penalty

| Field               | Value                                                                                   |
| ------------------- | --------------------------------------------------------------------------------------- |
| AC ID               | `AC-019`                                                                                |
| Scenario            | **Spec-derived:** a `CLUSTER_C` `MID_PROFESSIONAL` customer has no default debt type.   |
| Expected result     | `round_to_nearest_100(min(5,000 × 1.0 × 1.0, 10,000))` yields `approved_limit = 5,000`. |
| Traced REQ IDs      | `REQ-010`, `REQ-016`, `REQ-021`, `REQ-031`                                              |
| Verification level  | Unit credit-limit test                                                                  |
| Blocking assumption | None; default factor `1.0` is the approved interpretation in `ASM-006`                  |

### AC-020 — Default penalty activates once

| Field               | Value                                                                                                   |
| ------------------- | ------------------------------------------------------------------------------------------------------- |
| AC ID               | `AC-020`                                                                                                |
| Scenario            | **Spec-derived:** otherwise identical formula inputs contain `credit_default`, `loan_default`, or both. |
| Expected result     | Each case applies one `0.5` penalty factor; having both default types does not apply the penalty twice. |
| Traced REQ IDs      | `REQ-021`, `REQ-024`, `REQ-031`                                                                         |
| Verification level  | Parameterized unit credit-limit test                                                                    |
| Blocking assumption | None; single activation recorded in `ASM-006`                                                           |

### AC-021 — Cap enforcement

| Field               | Value                                                                                                                                                                                                                       |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC ID               | `AC-021`                                                                                                                                                                                                                    |
| Scenario            | **Spec-derived formula case:** `base_limit = 60,000`, `job_multiplier = 2.0`, `penalty_factor = 1.0`, and `cluster_cap = 100,000`. These operands test the published formula and are not an official business-rule fixture. |
| Expected result     | The unbounded value `120,000` is capped and produces `approved_limit = 100,000`.                                                                                                                                            |
| Traced REQ IDs      | `REQ-021`, `REQ-031`                                                                                                                                                                                                        |
| Verification level  | Unit credit-limit test                                                                                                                                                                                                      |
| Blocking assumption | None                                                                                                                                                                                                                        |

### AC-022 — Penalty is applied before the cap

| Field               | Value                                                                                                                                                                                                                   |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC ID               | `AC-022`                                                                                                                                                                                                                |
| Scenario            | **Spec-derived formula case:** `base_limit = 60,000`, `job_multiplier = 2.0`, `penalty_factor = 0.5`, and `cluster_cap = 100,000`. These operands test calculation order and are not an official business-rule fixture. |
| Expected result     | The formula calculates `60,000 × 2.0 × 0.5 = 60,000` before applying the cap, producing `approved_limit = 60,000`.                                                                                                      |
| Traced REQ IDs      | `REQ-021`, `REQ-023`, `REQ-024`, `REQ-031`                                                                                                                                                                              |
| Verification level  | Unit credit-limit order test                                                                                                                                                                                            |
| Blocking assumption | None                                                                                                                                                                                                                    |

### AC-023 — Nearest-100 rounding

| Field               | Value                                                                                                                                               |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC ID               | `AC-023`                                                                                                                                            |
| Scenario            | **Spec-derived formula cases:** uncapped pre-round values are `10,149`, `10,151`, `1,750`, and `3,750`.                                             |
| Expected result     | `10,149` rounds to `10,100`; `10,151` rounds to `10,200`; exact midpoint ties round upward, so `1,750` becomes `1,800` and `3,750` becomes `3,800`. |
| Traced REQ IDs      | `REQ-021`, `REQ-031`                                                                                                                                |
| Verification level  | Parameterized unit rounding test                                                                                                                    |
| Blocking assumption | None; midpoint interpretation resolved in `ASM-007`                                                                                                 |

### AC-024 — CLUSTER_D denial

| Field               | Value                                                                |
| ------------------- | -------------------------------------------------------------------- |
| AC ID               | `AC-024`                                                             |
| Scenario            | A customer is assigned `CLUSTER_D`, regardless of job category.      |
| Expected result     | `approved = false`, `approved_limit = 0`, and monthly income is `0`. |
| Traced REQ IDs      | `REQ-011`, `REQ-020`, `REQ-022`, `REQ-033`                           |
| Verification level  | Unit classification, income, and credit-limit test                   |
| Blocking assumption | None                                                                 |

## HTTP and integration behavior

### AC-025 — Valid classification request

| Field               | Value                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC ID               | `AC-025`                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Scenario            | **Spec-derived:** valid customer objects producing `CLUSTER_A`, `CLUSTER_B`, `CLUSTER_C`, and `CLUSTER_D` are posted to `/customers/classify`.                                                                                                                                                                                                                                                                                                                    |
| Expected result     | Each request returns HTTP `200 OK` with the original accepted customer object directly enriched at the top level with exactly these calculated fields: `cluster_id`, `cluster_name`, `job_category`, `monthly_income`, `approved`, and `approved_limit`. A–C return `approved = true`; D returns `approved = false`. Monetary fields are JSON numbers in BRL units. The body has no success envelope and exposes no internal calculation or rule-engine metadata. |
| Traced REQ IDs      | `REQ-011`, `REQ-019`, `REQ-021`, `REQ-025`, `REQ-026`, `REQ-034`                                                                                                                                                                                                                                                                                                                                                                                                  |
| Verification level  | Parameterized integration test                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Blocking assumption | None; approved fallback response recorded in `ASM-002` and HTTP behavior in `ASM-008`                                                                                                                                                                                                                                                                                                                                                                             |

### AC-026 — Stateless calls

| Field               | Value                                                                                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| AC ID               | `AC-026`                                                                                                                                               |
| Scenario            | Two classification requests are made independently, including repetition of an identifier.                                                             |
| Expected result     | Each request is evaluated only from its own body; no prior request is required or persisted, and identifier reuse does not create cross-request state. |
| Traced REQ IDs      | `REQ-025`, `REQ-027`                                                                                                                                   |
| Verification level  | Integration test                                                                                                                                       |
| Blocking assumption | None; identifier interpretation recorded in `ASM-005`                                                                                                  |

### AC-027 — Invalid or missing request fields

| Field               | Value                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC ID               | `AC-027`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Scenario            | **Spec-derived:** requests to `/customers/classify` contain a missing schema field, a wrong declared type, an out-of-range score, an invalid region, an invalid market-debt type, or malformed JSON.                                                                                                                                                                                                                                                                                              |
| Expected result     | Every case returns HTTP `400 Bad Request` and the shared application-owned `{ "error": { "code", "message", "details" } }` envelope. Schema failures use code `VALIDATION_ERROR`, message `Request validation failed`, and stable path/message details without unnecessary Zod-specific structure. Malformed JSON uses code `MALFORMED_JSON`, message `Request body contains invalid JSON`, and `details = []` with the same shared envelope schema. No case returns a successful classification. |
| Traced REQ IDs      | `REQ-035`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Verification level  | Parameterized integration test                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Blocking assumption | None; approved HTTP error contract recorded in `ASM-008`                                                                                                                                                                                                                                                                                                                                                                                                                                          |

### AC-028 — Six official sample customers

| Field               | Value                                                                                             |
| ------------------- | ------------------------------------------------------------------------------------------------- |
| AC ID               | `AC-028`                                                                                          |
| Scenario            | All six official customers from `expected-output.json` are posted to the classification endpoint. |
| Expected result     | Every response exactly matches the corresponding official expected output.                        |
| Traced REQ IDs      | `REQ-026`, `REQ-034`, `REQ-036`                                                                   |
| Verification level  | Parameterized integration test                                                                    |
| Blocking assumption | `ASM-001` — the official fixture and its six expected responses are missing                       |

## Test-suite and delivery obligations

### AC-029 — Required unit-test coverage

| Field               | Value                                                                                                                                                                                                                 |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC ID               | `AC-029`                                                                                                                                                                                                              |
| Scenario            | The unit-test suite is inspected and run.                                                                                                                                                                             |
| Expected result     | It covers every cluster and boundary, job matching case-insensitivity and priority, base formula, single penalty, cap, nearest-100 rounding including upward midpoint ties, all 20 income combinations, and D denial. |
| Traced REQ IDs      | `REQ-028`, `REQ-029`, `REQ-030`, `REQ-031`, `REQ-032`, `REQ-033`                                                                                                                                                      |
| Verification level  | Test-suite inspection and execution                                                                                                                                                                                   |
| Blocking assumption | None; midpoint behavior is resolved in `ASM-007`                                                                                                                                                                      |

### AC-030 — Required integration-test coverage

| Field               | Value                                                                                                                                                    |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC ID               | `AC-030`                                                                                                                                                 |
| Scenario            | The integration-test suite is inspected and run.                                                                                                         |
| Expected result     | It exercises valid and invalid full request/response cycles and contains the official six-sample comparison when the official fixture becomes available. |
| Traced REQ IDs      | `REQ-028`, `REQ-034`, `REQ-035`, `REQ-036`                                                                                                               |
| Verification level  | Test-suite inspection and execution                                                                                                                      |
| Blocking assumption | `ASM-001` only for the unavailable official six-sample comparison                                                                                        |

### AC-031 — Single-command test execution

| Field               | Value                                                  |
| ------------------- | ------------------------------------------------------ |
| AC ID               | `AC-031`                                               |
| Scenario            | The documented test command is invoked once.           |
| Expected result     | The complete test suite runs from that single command. |
| Traced REQ IDs      | `REQ-037`                                              |
| Verification level  | Command execution                                      |
| Blocking assumption | None                                                   |

### AC-032 — AI-journey documentation

| Field               | Value                                                                                                                                                                                                            |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC ID               | `AC-032`                                                                                                                                                                                                         |
| Scenario            | The repository's AI-journey documentation is inspected.                                                                                                                                                          |
| Expected result     | The directory contains a concise tool/purpose summary, selected prompts with outputs and iteration, and an honest, meaningful reflection covering what worked, what did not, and what would be done differently. |
| Traced REQ IDs      | `REQ-038`, `REQ-039`, `REQ-040`, `REQ-041`, `REQ-042`                                                                                                                                                            |
| Verification level  | Documentation inspection                                                                                                                                                                                         |
| Blocking assumption | None                                                                                                                                                                                                             |

### AC-033 — System capabilities and data-driven rules

| Field               | Value                                                                                                                                                                                                                   |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC ID               | `AC-033`                                                                                                                                                                                                                |
| Scenario            | The implemented service and its cluster, limit, job-category, income, and penalty rules are inspected.                                                                                                                  |
| Expected result     | The service exposes the required REST classification, credit-limit, and income capabilities, and the published business rules and values are representable as configuration rather than buried in classification logic. |
| Traced REQ IDs      | `REQ-001`, `REQ-002`                                                                                                                                                                                                    |
| Verification level  | API, architecture, and configuration inspection                                                                                                                                                                         |
| Blocking assumption | None                                                                                                                                                                                                                    |

## Approved fallback representation

### AC-034 — Monetary JSON representation

| Field               | Value                                                                                                                                                                                                                                               |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC ID               | `AC-034`                                                                                                                                                                                                                                            |
| Scenario            | **Spec-derived contract cases:** serialize BRL amounts of `6500`, `6500.25`, and `6500.5` in a calculated monetary field.                                                                                                                           |
| Expected result     | The JSON values are the numbers `6500`, `6500.25`, and `6500.5`, representing R$ 6.500,00, R$ 6.500,25, and R$ 6.500,50 respectively. They are not formatted currency strings or integer minor units, and trailing decimal zeroes are not required. |
| Traced REQ IDs      | `REQ-019`, `REQ-021`, `REQ-026`                                                                                                                                                                                                                     |
| Verification level  | Response-schema and serialization contract test                                                                                                                                                                                                     |
| Blocking assumption | None; approved monetary representation recorded in `ASM-002`                                                                                                                                                                                        |
