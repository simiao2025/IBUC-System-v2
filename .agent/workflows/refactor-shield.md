---
description: Policy to prevent unplanned refactorings and ensure impact analysis
---

# Policy: Planned Refactoring Only

To maintain system stability, every significant change or refactoring MUST follow this protocol:

## 1. Planning Phase
- You MUST create or update an `implementation_plan.md` artifact.
- The plan MUST include an **Impact Analysis** section (use `/impact-analysis` if unsure).
- You MUST use `notify_user` to request review of the plan.

## 2. Approval Phase
- Work MUST NOT start until the user or a designated admin provides explicit approval (e.g., "ok", "proceed").
- If the plan is rejected, update the plan and request review again.

## 3. Execution Phase
- All changes must be tracked in the `task.md`.
- No "silent" refactorings allowed while working on a specific feature.

## 4. Documentation Phase
- A `walkthrough.md` MUST be created or updated for every implementation task.
- Evidence of testing (screenshots, logs) MUST be included.

**Failure to follow this workflow results in a violation of project security policy.**
