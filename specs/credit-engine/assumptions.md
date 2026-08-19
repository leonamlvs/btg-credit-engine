# Credit Engine Assumptions

## ASM-001 â€” Missing official sample fixture

The challenge PDF references an `expected-output.json` containing six sample customers, but that artifact was not included in the material received.

### Decision

- Do not fabricate an official `expected-output.json`.
- Create deterministic test cases derived from the documented rules.
- Clearly label locally created fixtures as spec-derived cases.
- Revisit this assumption only if the missing official artifact is later provided.
