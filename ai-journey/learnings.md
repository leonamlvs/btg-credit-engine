# AI-Assisted Development Learnings

## Setup

- **ChatGPT Plus — GPT-5.6 Sol / High:** consultation, review, decision support, prompt refinement.
- **Codex — GPT-5.6 Sol / Extra High:** specification, planning, ambiguity analysis, adversarial review.
- **Codex — GPT-5.6 Sol / High:** implementation and repository changes.
- **Agent mode:** used without Goal Mode.
- **Hooks / MCPs:** not used.
- Separate contexts were used to keep each AI session focused on a specific responsibility.

## What worked well

- **Specification before code:** requirements, acceptance criteria, and assumptions reduced hidden implementation decisions.
- **AI as a detail checker:** useful for tracing tables, priorities, dependencies, edge cases, and test coverage.
- **Human-owned ambiguity resolution:** AI surfaced options; final behavior was explicitly approved before implementation.
- **Negative constraints improved results:** `do not implement`, `do not invent`, and `do not reopen approved decisions` were important prompt requirements.
- **Adversarial review was valuable:** AI found the `COO` / `Coordinator` collision by comparing rules across sections.
- **Verification gates helped:** `yarn verify`, tests, diff inspection, and `git diff --check` made completion measurable.
- **Avoiding speculative validation:** I did not add restrictions such as a UF enum when they were not part of the supplied contract.

## What did not work well

- **Ambiguities were resolved too incrementally:** this caused repeated updates across specs, plan, and tasks.
- **Implementation was authorized too early once:** the generated work was reverted and the planning step was repeated with stricter boundaries.
- **Planning prompts initially focused more on what to do than what not to do.**
- **README prompts lacked an explicit information budget:** the first result was too verbose for a reviewer.
- **Repository structure evolved during implementation:** obsolete empty folders and stale `dist` output required a later cleanup pass.

## What I would do differently

- Start with a single **ambiguity and blocker inventory** before creating detailed specs.
- Batch all **human decisions** and reconcile dependent documents once.
- Use a **high-level roadmap**, then a separate tactical plan for each milestone.
- Always state **do not implement** when the requested output is only a plan.
- Define allowed files, non-scope, and exit criteria in every repository-changing prompt.
- Define the **target reader and reading time** for documentation before asking AI to write it.
- Reserve Extra High reasoning for specification/audit work; use High for deterministic implementation.

## Resource efficiency

- Estimated **67–76%** of the analyzed AI usage was productive or justified.
- Estimated **24–33%** was realistically avoidable.
- The avoidable portion mainly came from reverted implementation, repeated ambiguity reconciliation, repeated audits, and documentation rework.
- The main optimization is not simply shorter prompts: it is **fewer unnecessary agentic rounds** through earlier ambiguity discovery and batched decisions.

## Main takeaway

- AI was most useful for preserving requirements, finding inconsistencies, generating repetitive coverage, and checking implementation against an agreed contract.
- The process worked best when the AI had a narrow scope, explicit source material, clear exit criteria, and no authority to silently fill specification gaps.
