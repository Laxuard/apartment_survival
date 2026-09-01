/* eslint-disable react-refresh/only-export-components */
import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/app/layouts/AppLayout';
import { AuthLayout } from '@/app/layouts/AuthLayout';
import { OnboardingLayout } from '@/app/layouts/OnboardingLayout';
import { AuthGuard, PublicGuard } from '@/features/auth';
import { HouseholdRequiredGuard } from '@/features/households';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { RouteErrorPage } from '@/components/common/RouteErrorPage';
import { NotFoundPage } from '@/components/common/NotFoundPage';



// ─── Lazy Loaded Feature Pages ───────────────────────────────────────────────
const LandingPage = lazy(() =>
  import('@/features/landing/pages/LandingPage').then((m) => ({
    default: m.LandingPage,
  }))
);
const LoginPage = lazy(() =>
  import('@/features/auth/pages/LoginPage').then((m) => ({
    default: m.LoginPage,
  }))
);
const InviteAcceptPage = lazy(() =>
  import('@/features/auth/pages/InviteAcceptPage').then((m) => ({
    default: m.InviteAcceptPage,
  }))
);
const HubPage = lazy(() =>
  import('@/features/hub/pages/HubPage').then((m) => ({
    default: m.HubPage,
  }))
);
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

const renderLazy = (Component: React.LazyExoticComponent<React.FC>) => (


  <Suspense fallback={<LoadingScreen />}>
    <Component />
  </Suspense>
);

export const router = createBrowserRouter([
  // ─── 0. PUBLIC MARKETING & AUTH ROUTES (Redirects to /hub if authenticated) ───
  {
    element: <PublicGuard />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        path: '/',
        element: renderLazy(LandingPage),
      },
      {
        path: '/welcome',
        element: renderLazy(LandingPage),
      },
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: renderLazy(LoginPage) },
        ],
      },
    ],
  },

  // ─── 1. SPECIAL INTERCEPT ROUTES (Publicly accessible, contextual flows) ─────
  {
    path: '/register',
    element: <Navigate to="/onboarding" replace />,
  },
  {
    path: '/onboarding',
    element: renderLazy(OnboardingPage),
    errorElement: <RouteErrorPage />,
  },
  {
    element: <OnboardingLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { path: '/onboarding/create', element: renderLazy(CreateHouseholdPage) },
      { path: '/onboarding/join', element: renderLazy(JoinHouseholdPage) },
    ],
  },
  {
    path: '/invite/:inviteToken',
    element: renderLazy(InviteAcceptPage),
    errorElement: <RouteErrorPage />,
  },
  {
    path: '/invite',
    element: renderLazy(InviteAcceptPage),
    errorElement: <RouteErrorPage />,
  },

  // ─── 2. PROTECTED MACRO & MICRO ROUTES (Requires valid Auth Token) ──────────────
  {
    element: <AuthGuard />,
    errorElement: <RouteErrorPage />,
    children: [
      // 2A. MACRO COMMAND CENTER (All user households & pending invites)
      {
        path: '/hub',
        element: renderLazy(HubPage),
      },

      // 2B. MICRO APARTMENT OPERATING WORKSPACE (Requires active household)
      {
        element: <HouseholdRequiredGuard />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { path: '/dashboard', element: renderLazy(DashboardPage) },
              { path: '/expenses', element: renderLazy(ExpensesPage) },
              { path: '/pantry', element: renderLazy(PantryPage) },
              { path: '/roommates', element: renderLazy(RoommatesPage) },
              { path: '/settings', element: renderLazy(SettingsPage) },
            ],
          },
        ],
      },
    ],
  },

  // ─── 3. CATCH-ALL ROUTE (Themed 404 Room Not Found) ─────────────────────────
  {
    path: '*',
    element: <NotFoundPage />,
    errorElement: <RouteErrorPage />,
  },
]);


