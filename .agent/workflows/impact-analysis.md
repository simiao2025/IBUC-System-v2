---
description: Perform a global impact analysis before implementing new features or refactoring.
---

# Global Impact Analysis Workflow

Before starting any implementation or refactoring, follow these steps to understand the global impact:

1. **Grep for Key Terms**: Use `grep_search` to find all occurrences of modified functions, types, components, or database tables across the entire project (src and backend).
2. **Identify Shared Features**: List features or modules that depend on the code being changed.
3. **Verify DTOs and Database Schema**: Check backend DTOs (`backend/src/**/dto/*.ts`) and database types (`src/types/database.ts`) for consistency.
4. **Research Cross-Feature Side-Effects**: Consider if changes in one area (e.g., student management) affect others (e.g., enrollment, finance, reports).
5. **Document findings in Implementation Plan**: Always include a "Global Impact" section in your `implementation_plan.md` artifact.
