import {
  IconBrandWhatsapp,
  IconCheck,
  IconLock,
  IconShoppingCart,
  IconTrendingUp,
} from '@tabler/icons-react';
import React from 'react';

export const HeroStage: React.FC = () => {
  return (
    <div className="relative max-w-5xl mx-auto my-10 select-none">
      {/* ─── 1. ATMOSPHERIC TERRACOTTA RADIAL GLOW ─────────────────── */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] sm:w-[850px] h-[420px] pointer-events-none blur-3xl opacity-75 z-0"
        style={{
          background:
            'radial-gradient(circle, rgba(193, 121, 61, 0.25) 0%, rgba(193, 121, 61, 0.08) 45%, transparent 70%)',
        }}
      />

      {/* ─── 2. AUTHENTIC BROWSER CHROME FRAME ─────────────────────── */}
      <div className="relative z-10 card-custom rounded-2xl border border-[var(--border-strong)] bg-[var(--card)] shadow-xl overflow-hidden">

        {/* Browser Top Navigation Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--canvas)]/80 backdrop-blur-sm">

          {/* Window Action Dots */}
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-[#E57373] inline-block shadow-2xs" />
            <span className="w-3 h-3 rounded-full bg-[#FFB74D] inline-block shadow-2xs" />
            <span className="w-3 h-3 rounded-full bg-[#81C784] inline-block shadow-2xs" />
          </div>

          {/* URL Search Pill */}
          <div className="px-4 py-1 rounded-lg bg-[var(--card)] border border-[var(--border)] text-xs text-[var(--muted)] font-mono flex items-center gap-1.5 shadow-2xs">
            <IconLock size={12} className="text-[var(--sage)]" />
            <span className="text-[var(--text)] font-semibold">app.apartmentsurvival.com</span>
            <span>/flat-4b</span>
          </div>

          {/* Live Status Pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--sage-tint)] text-[var(--sage)] text-[11px] font-semibold border border-[var(--sage)]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--sage)] animate-pulse" />
            <span>Active Household</span>
          </div>
        </div>

        {/* ─── 3. LAYERED PRODUCT VIGNETTE INSIDE MOCKUP ────────────── */}
        <div className="p-5 sm:p-7 bg-[var(--canvas)] space-y-5">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">

            {/* Main Component (Left 7 Cols): Net Balance Financial Anchor */}
            <div className="lg:col-span-7 card-custom p-6 bg-[var(--card)] border border-[var(--border)] flex flex-col justify-between space-y-6">

              <div>
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--border)]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                      Living Space Ledger
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-[var(--sage-tint)] text-[var(--sage)] border border-[var(--sage)]/40">
                      <IconTrendingUp size={13} />
                      Balanced
                    </span>
                  </div>
                  <span className="text-xs font-mono text-[var(--muted)]">MAD (Dirham)</span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono tabular-nums font-bold tracking-tight text-4xl sm:text-5xl text-[var(--positive-text)]">
                      +450.00
                    </span>
                    <span className="text-sm font-semibold text-[var(--muted)]">MAD</span>
                  </div>
                  <p className="text-xs text-[var(--muted)] font-medium">
                    Your net position across the apartment
                  </p>
                </div>
              </div>

              {/* Breakdown Sparkline */}
              <div className="space-y-2 bg-[var(--canvas)] p-3.5 rounded-xl border border-[var(--border)]">
                <div className="flex justify-between text-xs font-mono tabular-nums text-[var(--muted)]">
                  <span className="text-[var(--sage)] font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[var(--sage)] inline-block" />
                    Lent: +600.00 MAD
                  </span>
                  <span className="text-[var(--oak)] font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[var(--oak)] inline-block" />
                    Share: 150.00 MAD
                  </span>
                </div>
                <div className="h-2.5 w-full bg-[var(--card)] border border-[var(--border-strong)] rounded-full overflow-hidden flex">
                  <div className="bg-[var(--sage)] h-full" style={{ width: '75%' }} />
                  <div className="bg-[var(--oak)] h-full" style={{ width: '25%' }} />
                </div>
              </div>

              {/* Sub-Debt Indicators */}
              <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[var(--sage-tint)] text-[var(--sage)] flex items-center justify-center font-bold text-xs">
                    <IconCheck size={14} />
                  </div>
                  <span className="text-[var(--text)] font-medium">
                    Bob owes <strong>300 MAD</strong> &bull; Alice owes <strong>150 MAD</strong>
                  </span>
                </div>
                <span className="text-[11px] font-mono text-[var(--sage)] font-bold">1-Tap Settle</span>
              </div>
            </div>

            {/* Right Column (5 Cols): Overlapping Action Cards */}
            <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">

              {/* Overlapping Card 1: 1-Tap WhatsApp Nudge Card */}
              <div className="card-custom p-4 bg-[var(--card)] border border-[var(--border)] relative overflow-hidden group">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--border)]">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#25D366]">
                    <IconBrandWhatsapp size={16} />
                    <span>WhatsApp Nudge Generator</span>
                  </div>
                  <span className="text-[10px] text-[var(--muted)] font-mono">1-Tap Send</span>
                </div>

                <div className="bg-[#25D366]/10 border border-[#25D366]/25 rounded-xl p-3 text-xs text-[var(--text)] leading-relaxed relative">
                  <p className="italic text-[11px]">
                    &ldquo;Hey Bob, here&apos;s our Flat 4B tab (<strong>300 MAD</strong> for Wi-Fi & Power). Settle via Cash or Bank transfer! 🚀&rdquo;
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[11px] text-[var(--muted)]">Pre-filled with receipt breakdown</span>
                  <button className="px-3 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer">
                    <IconBrandWhatsapp size={14} />
                    <span>Nudge Bob</span>
                  </button>
                </div>
              </div>

              {/* Overlapping Card 2: Connected Pantry & QR Card */}
              <div className="card-custom p-4 bg-[var(--card)] border border-[var(--border)] space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text)]">
                    <IconShoppingCart size={15} className="text-[var(--sage)]" />
                    <span>Pantry Restock Tracker</span>
                  </div>
                  <span className="text-[10px] text-[var(--warn-text)] bg-[var(--warn-bg)] px-2 py-0.5 rounded font-bold">
                    1 Out of stock
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--canvas)] border border-[var(--border)]">
                    <div className="flex items-center gap-2">
                      <span>☕</span>
                      <span className="font-semibold text-[var(--text)]">Coffee Beans</span>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-[var(--negative-bg)] text-[var(--negative-text)] font-bold">
                      Out of stock
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--canvas)] border border-[var(--border)]">
                    <div className="flex items-center gap-2">
                      <span>📶</span>
                      <span className="font-semibold text-[var(--text)]">Guest Wi-Fi QR</span>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-[var(--sage-tint)] text-[var(--sage)] font-bold">
                      1-Tap Connect
                    </span>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
