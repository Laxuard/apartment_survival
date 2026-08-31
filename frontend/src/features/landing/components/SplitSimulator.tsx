import {
  IconCheck,
  IconSparkles,
  IconX,
} from '@tabler/icons-react';
import React, { useState } from 'react';

type ScenarioKey = 'circular' | 'carrefour';

interface TransferItem {
  from: string;
  to: string;
  amount: number;
  label?: string;
}

interface ScenarioData {
  title: string;
  description: string;
  withoutSimplification: {
    badge: string;
    transfers: TransferItem[];
    totalShuffled: string;
    footnote: string;
  };
  withSimplification: {
    badge: string;
    transfers: TransferItem[];
    netSumText: string;
    explanation: string;
  };
}

const SCENARIOS: Record<ScenarioKey, ScenarioData> = {
  circular: {
    title: '3-Way Circular Loop',
    description: 'Alex paid 150 for Bob, Bob paid 150 for Omar, Omar paid 150 for Alex.',
    withoutSimplification: {
      badge: '3 Transfers (450.00 MAD)',
      totalShuffled: '450.00 MAD shuffled in circles',
      transfers: [
        { from: 'Bob', to: 'Alex', amount: 150.0, label: 'Wi-Fi share' },
        { from: 'Omar', to: 'Bob', amount: 150.0, label: 'Electricity bill' },
        { from: 'Alex', to: 'Omar', amount: 150.0, label: 'Supermarket haul' },
      ],
      footnote: 'Traditional apps trigger 3 separate bank transfers for net-zero debt.',
    },
    withSimplification: {
      badge: '0 Transfers Needed',
      transfers: [],
      netSumText: '✨ Net Sum: 0.00 MAD',
      explanation:
        'Our graph contraction algorithm detects the circular loop and cancels out all 3 debts instantly. Zero bank transfers or cash required.',
    },
  },
  carrefour: {
    title: 'Carrefour Grocery & Wi-Fi',
    description: 'Alex paid 480 MAD for Wi-Fi & Power, Sara paid 320 MAD for Carrefour groceries.',
    withoutSimplification: {
      badge: '4 Multi-Way Transfers (533 MAD)',
      totalShuffled: '533.33 MAD fragmented across 4 transactions',
      transfers: [
        { from: 'Sara', to: 'Alex', amount: 160.0, label: 'Wi-Fi third' },
        { from: 'Omar', to: 'Alex', amount: 160.0, label: 'Wi-Fi third' },
        { from: 'Alex', to: 'Sara', amount: 106.67, label: 'Carrefour third' },
        { from: 'Omar', to: 'Sara', amount: 106.67, label: 'Carrefour third' },
      ],
      footnote: 'Without simplification, flatmates exchange partial refunds back and forth.',
    },
    withSimplification: {
      badge: '1 Consolidated Transfer',
      transfers: [
        { from: 'Omar', to: 'Alex', amount: 266.67, label: 'Single consolidated transfer' },
        { from: 'Sara', to: 'Alex', amount: 53.33, label: 'Net balance settlement' },
      ],
      netSumText: '⚡ Simplified to 2 Direct Payments',
      explanation:
        'Instead of 4 chaotic partial repayments, the algorithm collapses pairwise debts so no flatmate ever pays money back and forth.',
    },
  },
};

export const SplitSimulator: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<ScenarioKey>('circular');
  const scenario = SCENARIOS[selectedScenario];

  return (
    <div className="card-custom bg-[var(--card)] p-6 sm:p-8 rounded-2xl border border-[var(--border-strong)] shadow-lg select-none">

      {/* ─── 1. UNIFIED SCENARIO SELECTOR (TOP) ────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-6 border-b border-[var(--border)]">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
            Scenario Preview
          </span>
          <p className="text-xs text-[var(--muted)] mt-0.5">{scenario.description}</p>
        </div>

        {/* Clean, single segmented control */}
        <div className="inline-flex rounded-xl p-1 bg-[var(--canvas)] border border-[var(--border)] self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setSelectedScenario('circular')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${selectedScenario === 'circular'
                ? 'bg-[var(--card)] text-[var(--text)] shadow-2xs font-bold'
                : 'text-[var(--muted)] hover:text-[var(--text)]'
              }`}
          >
            3-Way Circular Loop
          </button>
          <button
            type="button"
            onClick={() => setSelectedScenario('carrefour')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${selectedScenario === 'carrefour'
                ? 'bg-[var(--card)] text-[var(--text)] shadow-2xs font-bold'
                : 'text-[var(--muted)] hover:text-[var(--text)]'
              }`}
          >
            Carrefour Grocery & Wi-Fi
          </button>
        </div>
      </div>

      {/* ─── 2. SIDE-BY-SIDE COMPARISON GRID ───────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">

        {/* LEFT COLUMN: The Problem / Traditional Way */}
        <div className="p-5 rounded-xl bg-[var(--canvas)] border border-[var(--border)] flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--negative-text)] uppercase tracking-wider">
                <IconX size={15} />
                <span>Without Simplification</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-[var(--negative-bg)] text-[var(--negative-text)] text-[11px] font-mono tabular-nums font-bold">
                {scenario.withoutSimplification.badge}
              </span>
            </div>

            <div className="space-y-2">
              {scenario.withoutSimplification.transfers.map((t, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-[var(--card)] border border-[var(--border)] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-[var(--negative-bg)] text-[var(--negative-text)] flex items-center justify-center font-bold text-[10px]">
                      →
                    </span>
                    <span className="font-medium text-[var(--text)]">
                      {t.from} pays {t.to}
                    </span>
                  </div>
                  <span className="font-mono tabular-nums font-bold text-[var(--negative-text)]">
                    {t.amount.toFixed(2)} MAD
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[var(--border)] text-[11px] text-[var(--muted)] leading-relaxed">
            ⚠️ {scenario.withoutSimplification.footnote}
          </div>
        </div>

        {/* RIGHT COLUMN: The Solution / Apartment Survival Engine */}
        <div className="p-5 rounded-xl bg-[var(--sage-tint)]/60 border border-[var(--sage)]/40 flex flex-col justify-between space-y-4 shadow-2xs">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--sage)]/30">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--positive-text)] uppercase tracking-wider">
                <IconCheck size={15} />
                <span>With Apartment Survival</span>
              </div>
              <span className="px-2.5 py-0.5 rounded bg-[var(--positive-bg)] text-[var(--positive-text)] text-[11px] font-semibold border border-[var(--sage)]/30">
                {scenario.withSimplification.badge}
              </span>
            </div>

            {selectedScenario === 'circular' ? (
              // 3-Way Circular Celebratory Box
              <div className="p-6 rounded-xl bg-[var(--card)] border border-[var(--sage)]/40 text-center space-y-2.5 my-auto">
                <div className="w-10 h-10 rounded-xl bg-[var(--sage-tint)] text-[var(--sage)] mx-auto flex items-center justify-center font-bold text-lg">
                  <IconSparkles size={20} />
                </div>
                <div className="font-bold text-base text-[var(--text)] font-serif">
                  {scenario.withSimplification.netSumText}
                </div>
                <p className="text-xs text-[var(--muted)] max-w-xs mx-auto leading-relaxed">
                  {scenario.withSimplification.explanation}
                </p>
              </div>
            ) : (
              // Consolidated Transfers List
              <div className="space-y-2">
                {scenario.withSimplification.transfers.map((s, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-[var(--card)] border border-[var(--sage)]/30 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-[var(--sage-tint)] text-[var(--sage)] flex items-center justify-center font-bold text-[10px]">
                        ✓
                      </span>
                      <span className="font-semibold text-[var(--text)]">
                        {s.from} pays {s.to}
                      </span>
                    </div>
                    <span className="font-mono tabular-nums font-bold text-sm text-[var(--positive-text)]">
                      {s.amount.toFixed(2)} MAD
                    </span>
                  </div>
                ))}
                <p className="text-[11px] text-[var(--muted)] pt-1 px-1">
                  {scenario.withSimplification.explanation}
                </p>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-[var(--sage)]/30 text-[11px] text-[var(--sage)] font-semibold flex items-center gap-1">
            <span>💡 Settle in 1 transaction instead of circular transfers.</span>
          </div>
        </div>

      </div>
    </div>
  );
};
