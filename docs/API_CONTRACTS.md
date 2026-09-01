# API Contracts & Type Manifest

> **Status Legend**:
> - `[SYNCED]` — Implemented in Spring Boot Backend & React Frontend (`apiClient`).
> - `[BACKEND-ONLY]` — Implemented in Spring Boot Backend; Frontend needs client adapter or UI hook.
> - `[FRONTEND-MOCK]` — UI/Client exists in Frontend; Backend endpoint pending implementation.

---

### 1. Authentication (`/api/auth`) — `[SYNCED]`
- `GET /api/auth/csrf`
  - **Response**: `{ token: string, headerName: string, parameterName: string }` *(Exchanges / generates XSRF cookie & token)*
- `POST /api/auth/login`
  - **Request**: `{ login: string, password: string }`
  - **Response**: `{ userId: UUID, email: string, username: string }` *(Sets HTTP-only session cookie)*
- `POST /api/auth/register`
  - **Request**: `{ email: string, username: string, password: string }`
  - **Response**: `{ userId: UUID, email: string, username: string }` *(Sets HTTP-only session cookie)*
- `POST /api/auth/logout`
  - **Response**: `204 No Content` *(Destroys session cookie)*

---

### 2. Current User Profile (`/api/me`) — `[SYNCED]`
- `GET /api/me`
  - **Response**: `{ userId: UUID, username: string, email: string, role: string, createdAt: string }`
- `PUT /api/me`
  - **Request**: `{ username?: string, email?: string }`
  - **Response**: `{ userId: UUID, username: string, email: string, role: string, createdAt: string }`
- `PUT /api/me/password`
  - **Request**: `{ currentPassword: string, newPassword: string }`
  - **Response**: `204 No Content`

---

### 3. User Invites Inbox (`/api/me/invites`) — `[SYNCED]`
- `GET /api/me/invites`
  - **Response**: `List<{ inviteId: UUID, householdId: UUID, householdName: string, householdDescription?: string, invitedByUsername: string, expiresAt: string, createdAt: string }>`
- `POST /api/me/invites/{inviteId}/accept`
  - **Response**: `HouseholdResponse.Summary`
- `POST /api/me/invites/{inviteId}/decline`
  - **Response**: `204 No Content`

---

### 4. Households (`/api/households`) — `[SYNCED]`
- `GET /api/households`
  - **Response**: `List<HouseholdResponse.Summary>`
- `POST /api/households`
  - **Request**: `{ name: string, description?: string, currency?: string, timezone?: string, maxMembers?: number, monthlyBudget?: number, wifiSsid?: string, wifiPassword?: string, splitAlgorithm?: string, defaultSplitMethod?: string, defaultSplitAllocations?: string, autoRestockFromExpenses?: boolean }`
  - **Response**: `HouseholdResponse.Summary`
- `GET /api/households/{householdId}`
  - **Response**: `HouseholdResponse.Detail` *(Includes `members: List<MemberSummary>`)*
- `GET /api/households/{householdId}/members`
  - **Response**: `List<{ userId: UUID, username: string, email: string, role: "ADMIN" | "MEMBER", nickname?: string, joinedAt: string }>`
- `PUT /api/households/{householdId}`
  - **Request**: `{ name?: string, description?: string, currency?: string, timezone?: string, maxMembers?: number, monthlyBudget?: number, wifiSsid?: string, wifiPassword?: string, splitAlgorithm?: string, defaultSplitMethod?: string, defaultSplitAllocations?: string, autoRestockFromExpenses?: boolean }`
  - **Response**: `HouseholdResponse.Summary`
- `DELETE /api/households/{householdId}`
  - **Response**: `204 No Content` *(Archives household)*
- `PUT /api/households/{householdId}/members/{targetUserId}`
  - **Request**: `{ role: "ADMIN" | "MEMBER", nickname?: string }`
  - **Response**: `HouseholdResponse.MemberSummary`
- `DELETE /api/households/{householdId}/members/{targetUserId}`
  - **Response**: `204 No Content` *(Removes roommate or self-leave)*
- `POST /api/households/join`
  - **Request**: `{ code: string }` *(8-character code)*
  - **Response**: `HouseholdResponse.Summary`

---

### 5. Household Invites Management (`/api/households/{householdId}/invites`) — `[SYNCED]`
- `POST /api/households/{householdId}/invites/direct`
  - **Request**: `{ username: string, validDays?: number }`
  - **Response**: `HouseholdInviteSummary: { inviteId: UUID, type: "LINK" | "DIRECT_USER", status: "PENDING" | "ACCEPTED" | "REVOKED" | "EXPIRED", code?: string, targetUsername?: string, maxUses?: number, usedCount: number, expiresAt: string, createdAt: string }`
- `POST /api/households/{householdId}/invites/link`
  - **Request**: `{ maxUses?: number, validDays?: number }`
  - **Response**: `HouseholdInviteSummary`
- `GET /api/households/{householdId}/invites`
  - **Response**: `List<HouseholdInviteSummary>`
- `DELETE /api/households/{householdId}/invites/{inviteId}`
  - **Response**: `204 No Content`

---

### 6. Expenses (`/api/households/{householdId}/expenses`) — `[SYNCED]`
- `GET /api/households/{householdId}/expenses?page=0&size=20&sort=expenseDate,desc`
  - **Response**: `List<{ id: UUID, title: string, amount: number, category: string, splitType: string, paidByUserId: UUID, paidByUsername: string, expenseDate: string, createdAt: string }>`
- `POST /api/households/{householdId}/expenses`
  - **Request**: `{ title: string, description?: string, amount: number, category: string, splitType?: "EQUAL" | "PERCENTAGE" | "EXACT" | "SHARES" | "ITEMIZED", expenseDate?: string, receiptUrl?: string, splits?: List<{ userId: UUID, amount?: number, percentage?: number, shares?: number }> }`
  - **Response**: `ExpenseResponse.Detail`
- `GET /api/households/{householdId}/expenses/{expenseId}`
  - **Response**: `ExpenseResponse.Detail: { id: UUID, householdId: UUID, title: string, description?: string, amount: number, category: string, splitType: string, paidByUserId: UUID, paidByUsername: string, expenseDate: string, receiptUrl?: string, splits: List<{ id: UUID, userId: UUID, username: string, amount: number, percentage?: number, shares?: number }>, createdAt: string }`
- `PUT /api/households/{householdId}/expenses/{expenseId}`
  - **Request**: `ExpenseRequest.Update`
  - **Response**: `ExpenseResponse.Detail`
- `DELETE /api/households/{householdId}/expenses/{expenseId}`
  - **Response**: `204 No Content`

---

### 7. Balances & Debt Simplification (`/api/households/{householdId}/balances`) — `[SYNCED]`
- `GET /api/households/{householdId}/balances`
  - **Response**: `{ householdId: UUID, currency: string, members: List<{ userId: UUID, username: string, totalPaid: number, totalAssigned: number, totalSettledPaid: number, totalSettledReceived: number, netBalance: number }>, simplifiedDebts: List<{ fromUserId: UUID, fromUsername: string, toUserId: UUID, toUsername: string, amount: number }> }`

---

### 8. Settlements (`/api/households/{householdId}/settlements`) — `[SYNCED]`
- `POST /api/households/{householdId}/settlements`
  - **Request**: `{ recipientUserId: UUID, amount: number, settledAt?: string, notes?: string }`
  - **Response**: `{ id: UUID, householdId: UUID, payerUserId: UUID, payerUsername: string, recipientUserId: UUID, recipientUsername: string, amount: number, settledAt: string, notes?: string, createdAt: string }`
- `GET /api/households/{householdId}/settlements?page=0&size=20&sort=settledAt,desc`
  - **Response**: `List<SettlementResponse.Detail>`

---

### 9. Bills & Subscriptions (`/api/households/{householdId}/bills`) — `[SYNCED]`
- `GET /api/households/{householdId}/bills`
  - **Response**: `List<{ id: UUID, title: string, dueText: string, dueDays: number, amount: number, currency: string, autoSplit: boolean, perPersonText: string, iconName: string, isPaid: boolean, category?: string, dueDayOfMonth?: number, responsiblePayerId?: string, lastPaidPeriod?: string }>`
- `POST /api/households/{householdId}/bills`
  - **Request**: `{ title: string, amount: number, category?: "RENT" | "UTILITIES" | "MAINTENANCE" | "OTHER", dueDayOfMonth?: number, dueDays?: number, responsiblePayerId?: string, autoSplit?: boolean, iconName?: string }`
  - **Response**: `BillResponse.Detail`
- `POST /api/households/{householdId}/bills/{billId}/pay`
  - **Response**: `{ success: boolean, billId: UUID }`
- **Frontend Engine Flow**: Recurring bills serve as schedule templates. When `Mark as Paid` is triggered, an `Expense` is automatically posted to `/api/households/{householdId}/expenses` (updating ledger & balances), and `lastPaidPeriod` is tagged (e.g. `2026-09`) to resolve urgent runway cycles.


---

### 10. Pantry & Groceries (`/api/households/{householdId}/pantry`) — `[SYNCED]`
- `GET /api/households/{householdId}/pantry`
  - **Response**: `List<{ id: UUID, name: string, category: string, status: string, badgeLabel: string, quantity: number, unit?: string, iconName: string, onGroceryList: boolean }>`
- `POST /api/households/{householdId}/pantry`
  - **Request**: `{ name: string, category: string, quantity?: number, unit?: string, iconName?: string }`
  - **Response**: `PantryResponse.Detail`
- `PUT /api/households/{householdId}/pantry/{itemId}/stock`
  - **Request**: `{ quantity: number, status?: string, badgeLabel?: string }`
  - **Response**: `PantryResponse.Detail`
- `POST /api/households/{householdId}/pantry/{itemId}/grocery`
  - **Request**: `{ onGroceryList: boolean }`
  - **Response**: `{ id: UUID, onGroceryList: boolean }`
