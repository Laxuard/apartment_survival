-- V1__initial_schema.sql
-- Baseline schema migration for Apartment Survival

-- 1. Users Table
CREATE TABLE users (
    id UUID NOT NULL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    account_locked BOOLEAN NOT NULL DEFAULT FALSE,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    version BIGINT
);

CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE UNIQUE INDEX idx_users_username ON users(username);

-- 2. Households Table
CREATE TABLE households (
    id UUID NOT NULL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    avatar_url VARCHAR(512),
    currency VARCHAR(3) NOT NULL DEFAULT 'MAD',
    timezone VARCHAR(50) NOT NULL DEFAULT 'Africa/Casablanca',
    max_members INTEGER NOT NULL DEFAULT 10,
    monthly_budget NUMERIC(12, 2) DEFAULT 0.00,
    wifi_ssid VARCHAR(100),
    wifi_password VARCHAR(100),
    split_algorithm VARCHAR(30) NOT NULL DEFAULT 'DEBT_SIMPLIFIED',
    default_split_method VARCHAR(30) NOT NULL DEFAULT 'EQUAL',
    default_split_allocations VARCHAR(2048),
    auto_restock_from_expenses BOOLEAN NOT NULL DEFAULT TRUE,
    archived BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    version BIGINT
);

CREATE INDEX idx_households_name ON households(name);

-- 3. Household Members Table
CREATE TABLE household_members (
    id UUID NOT NULL PRIMARY KEY,
    household_id UUID NOT NULL,
    user_id UUID NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'MEMBER',
    nickname VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    version BIGINT,
    CONSTRAINT uk_household_member_user UNIQUE (household_id, user_id),
    CONSTRAINT fk_household_members_household FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE
);

CREATE INDEX idx_household_members_user_id ON household_members(user_id);
CREATE INDEX idx_household_members_household_id ON household_members(household_id);
CREATE INDEX idx_household_members_auth ON household_members(household_id, user_id, role);

-- 4. Household Invites Table
CREATE TABLE household_invites (
    id UUID NOT NULL PRIMARY KEY,
    household_id UUID NOT NULL,
    created_by_user_id UUID NOT NULL,
    type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    target_user_id UUID,
    target_email VARCHAR(255),
    code VARCHAR(32) UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    max_uses INTEGER,
    used_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    version BIGINT,
    CONSTRAINT fk_household_invites_household FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE
);

CREATE INDEX idx_household_invites_code ON household_invites(code);
CREATE INDEX idx_household_invites_target_user ON household_invites(target_user_id);
CREATE INDEX idx_household_invites_household_status ON household_invites(household_id, status);

-- 5. Expenses Table
CREATE TABLE expenses (
    id UUID NOT NULL PRIMARY KEY,
    household_id UUID NOT NULL,
    paid_by_user_id UUID NOT NULL,
    title VARCHAR(120) NOT NULL,
    description VARCHAR(500),
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    category VARCHAR(30) NOT NULL,
    split_type VARCHAR(20) NOT NULL,
    expense_date TIMESTAMP WITH TIME ZONE NOT NULL,
    receipt_url VARCHAR(512),
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    participant_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    version BIGINT
);

CREATE INDEX idx_expenses_household_deleted_date ON expenses(household_id, deleted, expense_date);
CREATE INDEX idx_expenses_household_payer ON expenses(household_id, paid_by_user_id, deleted);
CREATE INDEX idx_expenses_category ON expenses(category);

-- 6. Expense Splits Table
CREATE TABLE expense_splits (
    id UUID NOT NULL PRIMARY KEY,
    expense_id UUID NOT NULL,
    user_id UUID NOT NULL,
    assigned_amount NUMERIC(12, 2) NOT NULL,
    split_value NUMERIC(8, 4),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    version BIGINT,
    CONSTRAINT uk_expense_split_user UNIQUE (expense_id, user_id),
    CONSTRAINT fk_expense_splits_expense FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE
);

CREATE INDEX idx_expense_splits_user ON expense_splits(user_id);
CREATE INDEX idx_expense_splits_expense ON expense_splits(expense_id);

-- 7. Settlements Table
CREATE TABLE settlements (
    id UUID NOT NULL PRIMARY KEY,
    household_id UUID NOT NULL,
    payer_user_id UUID NOT NULL,
    recipient_user_id UUID NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    settled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    notes VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    version BIGINT
);

CREATE INDEX idx_settlements_household_date ON settlements(household_id, settled_at);
CREATE INDEX idx_settlements_household_payer ON settlements(household_id, payer_user_id);
CREATE INDEX idx_settlements_household_recipient ON settlements(household_id, recipient_user_id);

-- 8. Pantry Items Table
CREATE TABLE pantry_items (
    id UUID NOT NULL PRIMARY KEY,
    household_id UUID NOT NULL,
    name VARCHAR(120) NOT NULL,
    category VARCHAR(60) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit VARCHAR(30),
    status VARCHAR(20) NOT NULL DEFAULT 'in_stock',
    badge_label VARCHAR(50) DEFAULT 'In Stock',
    icon_name VARCHAR(30) NOT NULL DEFAULT 'bread',
    on_grocery_list BOOLEAN NOT NULL DEFAULT FALSE,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    version BIGINT
);

CREATE INDEX idx_pantry_household_deleted ON pantry_items(household_id, deleted);
CREATE INDEX idx_pantry_household_category ON pantry_items(household_id, category, deleted);

-- 9. Bills Table
CREATE TABLE bills (
    id UUID NOT NULL PRIMARY KEY,
    household_id UUID NOT NULL,
    title VARCHAR(120) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'MAD',
    due_days INTEGER NOT NULL DEFAULT 7,
    due_text VARCHAR(100),
    auto_split BOOLEAN NOT NULL DEFAULT FALSE,
    icon_name VARCHAR(30) NOT NULL DEFAULT 'home',
    is_paid BOOLEAN NOT NULL DEFAULT FALSE,
    paid_by_user_id UUID,
    paid_at TIMESTAMP WITH TIME ZONE,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    version BIGINT
);

CREATE INDEX idx_bills_household_deleted ON bills(household_id, deleted);
CREATE INDEX idx_bills_household_due ON bills(household_id, due_days, deleted);

-- 10. Spring Modulith Event Publication Outbox Table
CREATE TABLE event_publication (
    id UUID NOT NULL PRIMARY KEY,
    listener_id VARCHAR(512) NOT NULL,
    event_type VARCHAR(512) NOT NULL,
    serialized_event VARCHAR(4000) NOT NULL,
    publication_date TIMESTAMP WITH TIME ZONE NOT NULL,
    completion_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20),
    completion_attempts INTEGER,
    last_resubmission_date TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_event_publication_date ON event_publication(publication_date);
CREATE INDEX idx_event_publication_serialized ON event_publication(serialized_event);
CREATE INDEX idx_event_publication_completion ON event_publication(completion_date);