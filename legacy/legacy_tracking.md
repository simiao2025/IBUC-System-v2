# Legacy Files Tracking

This document tracks files marked for refactoring as part of the "Safe & Incremental" refactoring plan.

## Legacy Files (To be refactored)

### 1. `src/pages/admin/UserManagement.tsx`

- **Current Status**: Active / Legacy
- **Responsibility**: Manages the main user administration interface. Handles listing, filtering, creating, updating, and deleting users.
- **Key Features**:
  - User list with filtering.
  - User creation and editing modals.
  - Role management (Admin, Director, Secretary, etc.).
  - Integration with `UsuarioService` and `PoloService`.
- **Refactoring Target**: Phase 2 & 3. Will be replaced by a unified user management module.

### 2. `src/components/settings/UserManagementSettings.tsx`

- **Current Status**: Active / Legacy
- **Responsibility**: Provides user management capabilities within the "Settings" context, likely for system administrators to configure permissions and user access.
- **Key Features**:
  - Similar CRUD operations to `UserManagement.tsx`.
  - Specific handling for "detailed" permissions or settings context.
  - Duplicates much logic from `UserManagement.tsx`.
- **Refactoring Target**: Phase 2 & 3. Will be consolidated into the unified module.

## Dead Code (To be removed)

### Removed on 2025-12-30

- `EnrollmentManagement.tsx.OLD` (and any other `*.OLD` files identified)
