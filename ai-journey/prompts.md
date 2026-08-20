# Key AI Prompts and Iterations

Selected interactions only — not a full log.

## Specification extraction

**Tool:** Codex — GPT-5.6 Sol, Extra High

**What I asked**

- Extract requirements before writing business code.
- Separate source requirements, assumptions, and acceptance criteria.
- Record ambiguities instead of silently resolving them.
- Do not implement during planning.

**What happened**

- Exposed missing `expected-output.json`, missing output contract, rounding ambiguity, and undefined HTTP error behavior.
- Created the specification baseline used for later planning and implementation.

**Iteration**

- Reduced assumption noise and kept locally derived scenarios explicitly labeled as spec-derived.

---

## Technical planning and task breakdown

**Tool:** Codex — GPT-5.6 Sol, Extra High

**What I asked**

- Build an inside-out implementation plan from the approved specs.
- Keep rules data-driven, domain logic pure, and HTTP outside the domain.
- Report new ambiguities instead of deciding them.

**What happened**

- Produced the task dependency graph and milestone structure.
- Detected the `COO` / `Coordinator` collision caused by substring matching and priority.

**Iteration**

- Kept the conflict blocked until a human decision was made.
- Learned to explicitly say **do not implement** when asking for a plan.

---

## Resolve remaining decisions before implementation

**Tools:** ChatGPT + Codex — GPT-5.6 Sol

**What I asked**

- List every unresolved issue as human decision, external blocker, resolved interpretation, or implementation detail.
- Show options and trade-offs without choosing for me.

**What happened**

- Consolidated decisions about rounding, approval, output fields, monetary representation, HTTP errors, acronym boundaries, and validation scope.
- Kept the missing official fixture as an external blocker instead of fabricating it.

**Iteration**

- Preferred conventional, unsurprising behavior when the source was silent.
- Avoided extra restrictions not explicitly required, such as a UF enum or two-character state validation.

---

## COO / Coordinator edge case

**Tool:** Codex — GPT-5.6 Sol, Extra High

**What I asked**

- Implement the approved distinction without hard-coding `COO` or `Coordinator`.
- Keep matching behavior configuration-driven.

**What happened**

- Added a generic standalone-term operator for executive acronyms.
- Preserved ordinary case-insensitive substring matching for other keywords.

**Final result**

- `COO`, `(COO)`, `COO/CTO` match executive.
- `Coordinator`, `myCOO`, `COO2` do not match the `COO` acronym.

---

## Implementation

**Tool:** Codex — GPT-5.6 Sol, High  
**Mode:** Agent, no Goal Mode

**What I asked**

- Implement the approved milestones without reopening business decisions.
- Preserve data-driven rules and verification gates.
- Do not invent the official fixture.

**What happened**

- Implemented validation, rules, classifiers, income, penalty, limit calculation, API contracts, Express endpoint, OpenAPI, and tests.
- Final verification passed with 14 test suites and 171 tests.

---

## Repository cleanup

**Tool:** Codex — GPT-5.6 Sol, High

**What I asked**

- Audit empty scaffolding and stale generated output without redesigning the architecture.

**What happened**

- Found stale files in `dist` from the previous source layout.
- Updated the build to clean `dist` before TypeScript compilation.
- Removed obsolete empty structure only where safe.

---

## README refinement

**Tools:** ChatGPT + Codex — GPT-5.6 Sol, High

**What I asked**

- Create a reviewer-friendly README based only on the actual repository.

**What happened**

- The first version contained too much detail.

**Iteration**

- Defined the audience and made the README an entry point, linking to detailed specs and architecture instead of duplicating them.
