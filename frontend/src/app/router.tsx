/* eslint-disable react-refresh/only-export-components */
import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/app/layouts/AppLayout';
import { AuthLayout } from '@/app/layouts/AuthLayout';
import { OnboardingLayout } from '@/app/layouts/OnboardingLayout';
import { ProtectedRoute, PublicOnlyRoute } from '@/features/auth';
import { HouseholdRequiredGuard } from '@/features/households/components/HouseholdRequiredGuard';
import { LoadingScreen } from '@/components/common/LoadingScreen';

// ─── Lazy Loaded Feature Pages (Individual Chunk Isolation) ──────────────────
const DashboardPage = lazy(() =>
  import('@/features/dashboard/pages/DashboardPage').then((m) => ({
    default: m.DashboardPage,
  }))
);
const ExpensesPage = lazy(() =>
  import('@/features/expenses/pages/ExpensesPage').then((m) => ({
    default: m.ExpensesPage,
  }))
);
const PantryPage = lazy(() =>
  import('@/features/pantry/pages/PantryPage').then((m) => ({
    default: m.PantryPage,
  }))
);
const RoommatesPage = lazy(() =>
  import('@/features/roommates/pages/RoommatesPage').then((m) => ({
    default: m.RoommatesPage,
  }))
);
const SettingsPage = lazy(() =>
  import('@/features/settings/pages/SettingsPage').then((m) => ({
    default: m.SettingsPage,
  }))
);

// Auth Pages
const LoginPage = lazy(() =>
  import('@/features/auth/pages/LoginPage').then((m) => ({
    default: m.LoginPage,
  }))
);
const RegisterPage = lazy(() =>
  import('@/features/auth/pages/RegisterPage').then((m) => ({
    default: m.RegisterPage,
  }))
);
const InviteAcceptPage = lazy(() =>
  import('@/features/auth/pages/InviteAcceptPage').then((m) => ({
    default: m.InviteAcceptPage,
  }))
);

// Onboarding Pages
const OnboardingPage = lazy(() =>
  import('@/features/onboarding/pages/OnboardingPage').then((m) => ({
    default: m.OnboardingPage,
  }))
);
const CreateHouseholdPage = lazy(() =>
  import('@/features/onboarding/pages/CreateHouseholdPage').then((m) => ({
    default: m.CreateHouseholdPage,
  }))
);
const JoinHouseholdPage = lazy(() =>
  import('@/features/onboarding/pages/JoinHouseholdPage').then((m) => ({
    default: m.JoinHouseholdPage,
  }))
);

const renderLazy = (Component: React.LazyExoticComponent<React.FC>) => (
  <Suspense fallback={<LoadingScreen />}>
    <Component />
  </Suspense>
);

export const router = createBrowserRouter([
  // ─── 1. GUEST-ONLY ROUTES (Redirect to / if logged in) ──────────────────────
  {
    element: <PublicOnlyRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: renderLazy(LoginPage) },
          { path: '/register', element: renderLazy(RegisterPage) },
        ],
      },
    ],
  },

  // ─── 2. UNIVERSAL INVITE ROUTE (Open to both logged-in & guest users) ───────
  {
    path: '/invite/:token',
    element: renderLazy(InviteAcceptPage),
  },

  // ─── 3. ONBOARDING ROUTES (Logged in, but no active household) ──────────────
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <OnboardingLayout />,
        children: [
          { path: '/onboarding', element: renderLazy(OnboardingPage) },
          { path: '/onboarding/create', element: renderLazy(CreateHouseholdPage) },
          { path: '/onboarding/join', element: renderLazy(JoinHouseholdPage) },
        ],
      },
    ],
  },

  // ─── 4. PROTECTED APP SHELL (Logged in + Member of ≥1 Household) ────────────
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <HouseholdRequiredGuard />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { index: true, element: renderLazy(DashboardPage) },
              { path: 'expenses', element: renderLazy(ExpensesPage) },
              { path: 'pantry', element: renderLazy(PantryPage) },
              { path: 'roommates', element: renderLazy(RoommatesPage) },
              { path: 'settings', element: renderLazy(SettingsPage) },
            ],
          },
        ],
      },
    ],
  },

  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
