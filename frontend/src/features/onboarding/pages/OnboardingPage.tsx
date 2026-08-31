import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  IconHome,
  IconCoins,
  IconPlus,
  IconTrash,
  IconSparkles,
  IconArrowRight,
  IconArrowLeft,
  IconCheck,
  IconUserPlus,
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthPanel } from '@/features/auth';
import { authApi } from '@/features/auth/api/authApi';
import type { RegisterDto, LoginDto } from '@/features/auth/types';
import { useAuthStore } from '@/stores/useAuthStore';
import { useHouseholdStore } from '@/stores/useHouseholdStore';
import { useOnboardingStore } from '@/stores/useOnboardingStore';
import { householdsApi } from '@/features/households/api/householdsApi';
import { useCreateHouseholdMutation } from '@/features/households';

const CURRENCIES = [
  { code: 'MAD', label: 'Moroccan Dirham', symbol: 'MAD' },
  { code: 'EUR', label: 'Euro', symbol: '€' },
  { code: 'USD', label: 'US Dollar', symbol: '$' },
  { code: 'GBP', label: 'British Pound', symbol: '£' },
];

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, setAuth } = useAuthStore();
  const addHousehold = useHouseholdStore((s) => s.addHousehold);
  const { draft, setDraft, addRoommateName, removeRoommateName, clearDraft } = useOnboardingStore();
  const createHouseholdMutation = useCreateHouseholdMutation();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [flatName, setFlatName] = useState(draft.householdName || '');
  const [selectedCurrency, setSelectedCurrency] = useState(draft.currency || 'MAD');
  const [roommateInput, setRoommateInput] = useState('');
  const [includeTemplates, setIncludeTemplates] = useState(draft.includeStarterTemplates ?? true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleAddRoommate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roommateInput.trim()) return;
    addRoommateName(roommateInput.trim());
    setRoommateInput('');
  };

  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flatName.trim()) return;
    setDraft({ householdName: flatName.trim(), currency: selectedCurrency });
    setStep(2);
  };

  const handleStep2Next = () => {
    setDraft({ includeStarterTemplates: includeTemplates });
    setStep(3);
  };

  // Flow for already authenticated users
  const handleLaunchAuthenticated = async () => {
    setIsSubmitting(true);
    try {
      const res = await createHouseholdMutation.mutateAsync({
        name: flatName.trim() || 'My Apartment',
        currency: selectedCurrency,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        maxMembers: Math.max(8, draft.roommateNames.length + 1),
      });

      clearDraft();
      toast.success(`Created "${res.name}"!`, {
        description: 'Welcome to your shared living dashboard.',
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create flat';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Flow for unauthenticated creators: atomic user creation + flat creation
  const handleRegisterAndLaunch = async (dto: RegisterDto) => {
    setIsSubmitting(true);
    setAuthError(null);
    try {
      // 1. Create User & Server Session
      const userSummary = await authApi.register(dto);

      // 2. Provision the flat using stored onboarding state
      const created = await householdsApi.createHousehold({
        name: flatName.trim() || 'My Apartment',
        currency: selectedCurrency,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        maxMembers: Math.max(8, draft.roommateNames.length + 1),
      });

      addHousehold({
        id: created.householdId,
        name: created.name,
        role: created.role || 'ADMIN',
        currency: typeof created.currency === 'string' ? created.currency : 'MAD',
        memberCount: 1,
        description: created.description,
        monthlyBudget: created.monthlyBudget ?? 0,
        capacity: created.maxMembers ?? 4,
        wifiSsid: created.wifiSsid || '',
        wifiPassword: created.wifiPassword || '',
        splitAlgorithm: created.splitAlgorithm || 'DEBT_SIMPLIFIED',
        autoRestockFromExpenses: created.autoRestockFromExpenses ?? true,
      });

      clearDraft();

      // 3. Mark Auth Session
      setAuth(
        {
          id: userSummary.userId,
          name: userSummary.username,
          email: userSummary.email,
        },
        'session-cookie-active'
      );

      toast.success(`Welcome to ${created.name}, ${userSummary.username}!`, {
        description: 'Your household is saved and your dashboard is live.',
      });

      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      setAuthError(msg);
      toast.error('Unable to create account', {
        description: msg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sign In Flow in Step 3 for users who already have an account
  const handleLoginAndLaunch = async (dto: LoginDto) => {
    setIsSubmitting(true);
    setAuthError(null);
    try {
      const userSummary = await authApi.login(dto);

      const created = await householdsApi.createHousehold({
        name: flatName.trim() || 'My Apartment',
        currency: selectedCurrency,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        maxMembers: Math.max(8, draft.roommateNames.length + 1),
      });

      addHousehold({
        id: created.householdId,
        name: created.name,
        role: created.role || 'ADMIN',
        currency: typeof created.currency === 'string' ? created.currency : 'MAD',
        memberCount: 1,
        description: created.description,
        monthlyBudget: created.monthlyBudget ?? 0,
        capacity: created.maxMembers ?? 4,
        wifiSsid: created.wifiSsid || '',
        wifiPassword: created.wifiPassword || '',
        splitAlgorithm: created.splitAlgorithm || 'DEBT_SIMPLIFIED',
        autoRestockFromExpenses: created.autoRestockFromExpenses ?? true,
      });

      clearDraft();

      setAuth(
        {
          id: userSummary.userId,
          name: userSummary.username,
          email: userSummary.email,
        },
        'session-cookie-active'
      );

      toast.success(`Welcome back, ${userSummary.username}! Created "${created.name}".`);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sign in failed';
      setAuthError(msg);
      toast.error('Sign in failed', {
        description: msg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--canvas)] flex flex-col justify-between p-4 sm:p-6 select-none">
      {/* Top Header */}
      <header className="max-w-2xl w-full mx-auto flex items-center justify-between pb-4 border-b border-[var(--border)]">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[var(--oak)] to-[#D07B30] text-white flex items-center justify-center font-bold shadow-xs">
            <IconHome size={18} />
          </div>
          <span className="font-serif font-bold text-sm sm:text-base text-[var(--text)]">Apartment Survival</span>
        </Link>

        {/* Wizard Step Tracker */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all duration-300 ${
                s === step
                  ? 'w-6 bg-[var(--oak)]'
                  : s < step
                  ? 'w-2 bg-[var(--sage)]'
                  : 'w-2 bg-[var(--border-strong)]'
              }`}
            />
          ))}
          <span className="text-[11px] font-semibold text-[var(--muted)] ml-1">Step {step} of 3</span>
        </div>
      </header>

      {/* Main Wizard Card */}
      <main className="max-w-xl w-full mx-auto my-auto py-8">
        <div className="card-custom p-6 sm:p-8 rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-xl space-y-6 animate-fade-up">
          {/* STEP 1: Flat Details */}
          {step === 1 && (
            <form onSubmit={handleStep1Next} className="space-y-6">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-[var(--oak-tint)] text-[var(--oak)] border border-[var(--oak)]/30">
                  <IconSparkles size={13} />
                  <span>Household Setup</span>
                </div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--text)] tracking-tight">
                  Name Your Shared Space
                </h1>
                <p className="text-xs sm:text-sm text-[var(--muted)]">
                  Start with your apartment or trip nickname and select your primary currency.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="flat-name-input" className="text-xs font-semibold text-[var(--text)] block">
                    Apartment Name or Unit
                  </label>
                  <Input
                    id="flat-name-input"
                    type="text"
                    placeholder="e.g., Casa Flat, Marrakech 2026"
                    value={flatName}
                    onChange={(e) => setFlatName(e.target.value)}
                    required
                    className="h-12 rounded-xl bg-[var(--canvas)] border-[var(--border-strong)] text-sm sm:text-base px-4 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--oak)]/50 focus-visible:border-[var(--oak)] transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[var(--text)] flex items-center gap-1.5">
                    <IconCoins size={14} className="text-[var(--oak)]" />
                    <span>Primary Currency</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    {CURRENCIES.map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => setSelectedCurrency(c.code)}
                        className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                          selectedCurrency === c.code
                            ? 'border-[var(--oak)] bg-[var(--oak-tint)]/80 ring-2 ring-[var(--oak)]/20 shadow-xs'
                            : 'border-[var(--border)] bg-[var(--canvas)] text-[var(--text)] hover:bg-[var(--card)] hover:border-[var(--border-strong)]'
                        }`}
                      >
                        <div className="font-mono text-sm sm:text-base font-bold text-[var(--oak)]">{c.code}</div>
                        <div className="text-[10.5px] text-[var(--muted)] truncate mt-0.5">{c.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Link
                  to="/onboarding/join"
                  className="text-xs text-[var(--muted)] hover:text-[var(--text)] inline-flex items-center gap-1"
                >
                  <IconUserPlus size={14} /> Have an invite code?
                </Link>

                <Button
                  type="submit"
                  disabled={!flatName.trim()}
                  className="btn-tactile h-11 px-6 rounded-xl bg-[var(--oak)] hover:bg-[var(--oak-hover)] text-white text-xs sm:text-sm font-semibold shadow-sm cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[var(--oak)]"
                >
                  <span>Continue</span>
                  <IconArrowRight size={15} />
                </Button>
              </div>
            </form>
          )}

          {/* STEP 2: Placeholder Flatmates & Templates */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-[var(--muted)] hover:text-[var(--text)] inline-flex items-center gap-1 mb-1 cursor-pointer"
                >
                  <IconArrowLeft size={13} /> Back to details
                </button>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--text)] tracking-tight">
                  Who Are You Splitting With?
                </h2>
                <p className="text-xs sm:text-sm text-[var(--muted)]">
                  Add flatmate placeholder names. You can invite them with WhatsApp links anytime later.
                </p>
              </div>

              {/* Add Roommate Input */}
              <form onSubmit={handleAddRoommate} className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="e.g. Sara, Omar, Alex..."
                  value={roommateInput}
                  onChange={(e) => setRoommateInput(e.target.value)}
                  className="h-11 rounded-xl bg-[var(--canvas)] border-[var(--border-strong)] text-xs sm:text-sm px-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--oak)]/50 focus-visible:border-[var(--oak)] transition-all"
                />
                <Button
                  type="submit"
                  disabled={!roommateInput.trim()}
                  className="btn-tactile h-11 px-4 rounded-xl bg-[var(--oak)] hover:bg-[var(--oak-hover)] text-white text-xs font-semibold shrink-0 cursor-pointer inline-flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[var(--oak)]"
                >
                  <IconPlus size={14} />
                  <span>Add</span>
                </Button>
              </form>

              {/* Roommate Chips */}
              <div className="min-h-[60px] p-3 rounded-2xl bg-[var(--canvas)] border border-[var(--border)] flex flex-wrap gap-2 items-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[var(--oak-tint)] text-[var(--oak)] text-xs font-bold border border-[var(--oak)]/30">
                  <span>👤 You (Host)</span>
                </span>
                {draft.roommateNames.map((name, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[var(--card)] border border-[var(--border)] text-xs font-medium text-[var(--text)] shadow-2xs"
                  >
                    <span>{name}</span>
                    <button
                      type="button"
                      onClick={() => removeRoommateName(index)}
                      className="text-[var(--muted)] hover:text-[var(--negative-text)] cursor-pointer"
                    >
                      <IconTrash size={12} />
                    </button>
                  </span>
                ))}
                {draft.roommateNames.length === 0 && (
                  <span className="text-xs text-[var(--muted)]">
                    Type a roommate name above and click Add (or skip if living solo).
                  </span>
                )}
              </div>

              {/* Starter Template Checkbox */}
              <div
                onClick={() => setIncludeTemplates(!includeTemplates)}
                className="p-3.5 rounded-2xl border border-[var(--border)] bg-[var(--canvas)] hover:border-[var(--border-strong)] transition-colors flex items-start gap-3 cursor-pointer select-none"
              >
                <div
                  className={`w-5 h-5 rounded-lg border flex items-center justify-center mt-0.5 transition-colors shrink-0 ${
                    includeTemplates
                      ? 'bg-[var(--oak)] border-[var(--oak)] text-white'
                      : 'border-[var(--border-strong)] bg-[var(--card)]'
                  }`}
                >
                  {includeTemplates && <IconCheck size={13} />}
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-[var(--text)] flex items-center gap-1.5">
                    <IconSparkles size={13} className="text-[var(--sage)]" />
                    <span>Auto-seed Wi-Fi, Rent & Coffee Tracker</span>
                  </div>
                  <p className="text-[11px] text-[var(--muted)]">
                    Pre-configures standard Moroccan apartment split categories and staple pantry essentials.
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleStep2Next}
                  className="btn-tactile h-11 px-6 rounded-xl bg-[var(--oak)] hover:bg-[var(--oak-hover)] text-white text-xs sm:text-sm font-semibold shadow-sm cursor-pointer inline-flex items-center gap-1.5"
                >
                  <span>Review & Save</span>
                  <IconArrowRight size={15} />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Contextual Account Creation & Flat Launch */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs text-[var(--muted)] hover:text-[var(--text)] inline-flex items-center gap-1 mb-1 cursor-pointer"
                >
                  <IconArrowLeft size={13} /> Back to flatmates
                </button>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--text)] tracking-tight">
                  {isAuthenticated ? 'Launch Your Space' : 'Create Account to Save Flat'}
                </h2>
                <p className="text-xs sm:text-sm text-[var(--muted)]">
                  {isAuthenticated
                    ? `Save "${flatName || 'My Flat'}" and launch your shared ledger.`
                    : `Sign up to save "${flatName || 'My Flat'}" and start splitting expenses.`}
                </p>
              </div>

              {/* Summary Pill */}
              <div className="p-3.5 rounded-2xl bg-[var(--canvas)] border border-[var(--border)] flex flex-wrap items-center justify-between gap-2 text-xs">
                <div>
                  <span className="font-bold text-[var(--text)]">{flatName || 'My Flat'}</span>
                  <span className="text-[var(--muted)] ml-2">({selectedCurrency})</span>
                </div>
                <div className="text-[var(--muted)] font-medium">
                  {draft.roommateNames.length > 0
                    ? `Splitting with ${draft.roommateNames.join(', ')}`
                    : 'Living Solo'}
                </div>
              </div>

              {/* Contextual Flow */}
              {isAuthenticated ? (
                <div className="space-y-3 pt-2">
                  <div className="text-xs text-[var(--sage)] bg-[var(--sage-tint)] p-3 rounded-xl border border-[var(--sage)]/30">
                    Signed in as <strong className="text-[var(--text)]">{user?.name}</strong> ({user?.email})
                  </div>
                  <Button
                    onClick={handleLaunchAuthenticated}
                    disabled={isSubmitting}
                    className="btn-tactile w-full h-12 rounded-xl bg-[var(--oak)] hover:bg-[var(--oak-hover)] text-white text-xs sm:text-sm font-semibold shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      'Launching ledger...'
                    ) : (
                      <>
                        <IconCheck size={18} />
                        <span>Save & Launch {flatName || 'Apartment'}</span>
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <AuthPanel
                  initialMode="register"
                  allowToggleMode={true}
                  submitLabel={`Save "${flatName || 'Flat'}" & Launch`}
                  isSubmitting={isSubmitting}
                  errorMessage={authError}
                  onSubmitRegister={handleRegisterAndLaunch}
                  onSubmitLogin={handleLoginAndLaunch}
                />
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-[var(--muted)] py-2">
        Apartment Survival · Reverse Onboarding Setup
      </footer>
    </div>
  );
};
