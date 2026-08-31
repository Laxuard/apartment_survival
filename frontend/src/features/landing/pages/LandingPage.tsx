import { Button } from '@/components/ui/button';
import {
  IconBuildingCommunity,
  IconChevronDown,
  IconSparkles,
} from '@tabler/icons-react';
import React from 'react';
import { Link } from 'react-router-dom';
import { BentoGrid } from '../components/BentoGrid';
import { HeroStage } from '../components/HeroStage';
import { LandingNavbar } from '../components/LandingNavbar';
import { SplitSimulator } from '../components/SplitSimulator';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--text)] transition-colors duration-200 selection:bg-[var(--oak-tint)] selection:text-[var(--oak-hover)]">
      {/* ─── 1. MINIMALIST NAVIGATION ──────────────────────────────── */}
      <LandingNavbar />

      {/* ─── 2. HERO SECTION (WITH AMPLE TOP PADDING TO PREVENT CLIPPING) ──── */}
      <section className="pt-28 sm:pt-36 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-fade-in">
        <div className="text-center max-w-4xl mx-auto space-y-5">

          {/* Concrete Friction Title */}
          <h1 className="text-4xl sm:text-6xl font-normal tracking-tight text-[var(--text)] font-serif leading-[1.14] text-balance">
            No more chasing roommates for <span className="italic text-[var(--oak)]">Wi-Fi money</span>.
          </h1>

          {/* Friction-Driven Subheading */}
          <p className="text-base sm:text-lg text-[var(--muted)] max-w-2xl mx-auto leading-relaxed text-pretty">
            The shared apartment ledger that turns messy group chats and 3-way debts into one-tap WhatsApp repayments, automated rent schedules, and a connected pantry.
          </p>

          {/* Action Callouts with Unified 10px / 12px Rounded Rectangles & Shadcn Button */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/onboarding">
              <Button
                size="lg"
                className="btn-tactile bg-[var(--oak)] hover:bg-[var(--oak-hover)] text-white text-sm font-semibold px-6 py-3.5 h-12 rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
              >
                <span>Set up your flat in 60s</span>
                <span>→</span>
              </Button>
            </Link>

            <a href="#simulator">
              <Button
                variant="outline"
                size="lg"
                className="btn-tactile border border-[var(--border-strong)] bg-[var(--card)] hover:bg-[var(--sage-tint)] text-[var(--text)] text-sm font-semibold px-6 py-3.5 h-12 rounded-xl shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>Try live split demo</span>
                <span>↓</span>
              </Button>
            </a>
          </div>

          <div className="pt-3 text-xs text-[var(--muted)] flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <span>✓ Zero setup required</span>
            <span>&bull;</span>
            <span>✓ Instant WhatsApp nudges</span>
            <span>&bull;</span>
            <span>✓ Free for all flatmates</span>
          </div>
        </div>

        {/* ─── 3. THE HERO STAGE: LAYERED PRODUCT VIGNETTE ─────────── */}
        <HeroStage />
      </section>

      {/* ─── 4. LIVE INTERACTIVE SPLIT SANDBOX ─────────────────────── */}
      <section id="simulator" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[var(--border)]">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--oak)]">Live Split Sandbox</span>
          <h2 className="text-3xl sm:text-4xl font-normal text-[var(--text)] font-serif mt-1">
            Zero Math. Zero Circular IOUs.
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[var(--muted)]">
            Test how our graph algorithm collapses multi-roommate spending into the exact minimum direct settlements.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <SplitSimulator />
        </div>
      </section>

      {/* ─── 5. ASYMMETRIC BENTO GRID FEATURE SHOWCASE ─────────────── */}
      <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[var(--border)]">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--sage)]">Apartment Modules</span>
          <h2 className="text-3xl sm:text-4xl font-normal text-[var(--text)] font-serif mt-1">
            Engineered for Real Shared Living
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[var(--muted)]">
            Every module addresses a specific headache of living with roommates.
          </p>
        </div>

        <BentoGrid />
      </section>

      {/* ─── 6. FAQ SECTION ────────────────────────────────────────── */}
      <section id="faq" className="py-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto border-t border-[var(--border)] select-none">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Clear Answers</span>
          <h2 className="text-3xl font-normal text-[var(--text)] font-serif mt-1">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          <details className="group card-custom rounded-xl p-4.5 border border-[var(--border)] bg-[var(--card)] cursor-pointer">
            <summary className="font-semibold text-sm text-[var(--text)] flex justify-between items-center list-none">
              <span>Is Apartment Survival completely free for our flat?</span>
              <IconChevronDown size={16} className="text-[var(--oak)] group-open:rotate-180 transition-transform" />
            </summary>
            <p className="mt-3 text-xs text-[var(--muted)] leading-relaxed">
              Yes. You can create your household, invite roommates with 1-click links or 6-digit codes, manage shared expenses, and track your pantry with zero fees.
            </p>
          </details>

          <details className="group card-custom rounded-xl p-4.5 border border-[var(--border)] bg-[var(--card)] cursor-pointer">
            <summary className="font-semibold text-sm text-[var(--text)] flex justify-between items-center list-none">
              <span>How does the debt simplification algorithm prevent circular debt?</span>
              <IconChevronDown size={16} className="text-[var(--oak)] group-open:rotate-180 transition-transform" />
            </summary>
            <p className="mt-3 text-xs text-[var(--muted)] leading-relaxed">
              Instead of tracking dozens of individual transaction pairs, the algorithm calculates each roommate&apos;s net balance (total lent minus fair share) and pairs net debtors with net creditors. If 3 roommates have cyclic debts that cancel out, the system reduces the required transfers to zero.
            </p>
          </details>

          <details className="group card-custom rounded-xl p-4.5 border border-[var(--border)] bg-[var(--card)] cursor-pointer">
            <summary className="font-semibold text-sm text-[var(--text)] flex justify-between items-center list-none">
              <span>What happens if a roommate moves out with unsettled debts?</span>
              <IconChevronDown size={16} className="text-[var(--oak)] group-open:rotate-180 transition-transform" />
            </summary>
            <p className="mt-3 text-xs text-[var(--muted)] leading-relaxed">
              The built-in Settle-Before-Leave safety guard prevents any member or admin from leaving the space until their active ledger balance is exactly 0.00 MAD, ensuring the remaining flatmates are never left with unpaid rent or bills.
            </p>
          </details>
        </div>
      </section>

      {/* ─── 7. FINAL CALL TO ACTION ───────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-[var(--border)] text-center">
        <div className="card-custom rounded-2xl p-8 sm:p-10 bg-[var(--oak-tint)] border border-[var(--border-strong)] space-y-4">
          <div className="w-10 h-10 rounded-xl bg-[var(--oak)] text-white mx-auto flex items-center justify-center font-bold shadow-sm">
            <IconSparkles size={22} />
          </div>
          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[var(--text)]">
            Ready to end the roommate money drama?
          </h2>
          <p className="text-xs sm:text-sm text-[var(--muted)] max-w-md mx-auto">
            Open the dashboard, explore live split calculations, and manage your flat with zero friction.
          </p>
          <div className="pt-2">
            <Link to="/dashboard">
              <Button
                size="lg"
                className="btn-tactile bg-[var(--oak)] hover:bg-[var(--oak-hover)] text-white text-sm font-semibold px-6 py-3.5 h-12 rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <span>Open Apartment Dashboard</span>
                <span>→</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 8. FOOTER ─────────────────────────────────────────────── */}
      <footer className="border-t border-[var(--border)] bg-[var(--card)] py-10 px-4 sm:px-6 lg:px-8 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--muted)]">
          <div className="flex items-center space-x-2.5">
            <span className="w-6 h-6 rounded-lg bg-[var(--oak-tint)] text-[var(--oak)] flex items-center justify-center font-bold text-xs">
              <IconBuildingCommunity size={14} />
            </span>
            <span className="font-bold text-[var(--text)] font-serif">Apartment Survival</span>
          </div>
          <p>&copy; 2026 Apartment Survival. Crafted with Warm Canvas, Oak & Sage tokens.</p>
          <div className="flex space-x-5 font-semibold">
            <a href="#simulator" className="hover:text-[var(--text)] transition-colors">Split Engine</a>
            <a href="#features" className="hover:text-[var(--text)] transition-colors">Modules</a>
            <a href="#faq" className="hover:text-[var(--text)] transition-colors">FAQ</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
