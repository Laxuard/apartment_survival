# Java Backend Architectural & Testing Rules

## 1. Modular Architecture & Invariants
- Enforce strict package modularity (IAM, Household, Expense). Cross-module interactions MUST go through Public API interfaces (e.g. `UserPublicApi`, `HouseholdPublicApi`), never by directly querying repositories of another domain.
- Keep all controllers and DTOs immutable using Java `record`s with Jakarta Validation annotations (`@NotNull`, `@DecimalMin`, `@NotBlank`).

## 2. Verification Invariant
- Every PR or endpoint modification must maintain 100% test pass rates (`./mvnw test`) including `ModularityTests` (ArchUnit package rules).

