import {
  IconBrandWhatsapp,
  IconCalendarEvent,
  IconCheck,
  IconReceipt2,
  IconShieldLock,
  IconShoppingCart,
} from '@tabler/icons-react';
import React, { useState } from 'react';

export const BentoGrid: React.FC = () => {
  // Interactive state for Tile 2: Connected Pantry Levels
  const [coffeeStatus, setCoffeeStatus] = useState<'in_stock' | 'low' | 'out'>('in_stock');
  const [oilStatus, setOilStatus] = useState<'in_stock' | 'low' | 'out'>('in_stock');

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 select-none">

      {/* ─── TILE 1 (2-Column): Multi-Mode Shared Ledger ─────────────── */}
      <div className="md:col-span-2 card-custom p-6 sm:p-7 rounded-2xl border border-[var(--border)] bg-[var(--card)] flex flex-col justify-between space-y-5">
        <div>
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[var(--oak-tint)] text-[var(--oak)] flex items-center justify-center font-bold">
                <IconReceipt2 size={20} />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-[var(--text)]">
                  The Multi-Mode Shared Ledger
                </h3>
                <span className="text-xs text-[var(--muted)]">Equal, percentage, or itemized custom shares</span>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-[var(--sage-tint)] text-[var(--sage)] font-semibold font-mono">
              MAD &bull; EUR &bull; USD
            </span>
          </div>

          <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed mb-5">
            Log common expenses with instant flatmate splits. Record offline cash payments, categorize household spending (Rent, Utilities, Groceries), and eliminate messy receipt spreadsheets forever.
          </p>

          {/* Clean Row Items */}
          <div className="space-y-2">
            <div className="p-3 rounded-xl bg-[var(--canvas)] border border-[var(--border)] flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-[var(--cat-groceries-bg)] text-[var(--cat-groceries-text)] flex items-center justify-center text-xs font-bold">
                  🛒
                </span>
                <div>
                  <div className="font-semibold text-[var(--text)]">Weekly Supermarket Haul</div>
                  <div className="text-[11px] text-[var(--muted)]">Paid by Alex &bull; Split equally (4 flatmates)</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono tabular-nums font-bold text-[var(--text)]">340.00 MAD</div>
                <div className="text-[10px] text-[var(--muted)]">85.00 MAD / person</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[var(--canvas)] border border-[var(--border)] flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-[var(--cat-utilities-bg)] text-[var(--cat-utilities-text)] flex items-center justify-center text-xs font-bold">
                  ⚡
                </span>
                <div>
                  <div className="font-semibold text-[var(--text)]">High-Speed Fiber Wi-Fi (100 Mbps)</div>
                  <div className="text-[11px] text-[var(--muted)]">Paid by Sara &bull; Monthly recurring</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono tabular-nums font-bold text-[var(--text)]">500.00 MAD</div>
                <div className="text-[10px] text-[var(--muted)]">125.00 MAD / person</div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-[var(--border)] flex flex-wrap items-center gap-4 text-xs font-medium text-[var(--muted)]">
          <span className="text-[var(--positive-text)]">✓ Multi-currency support</span>
          <span className="text-[var(--positive-text)]">✓ Offline cash settlement logging</span>
          <span className="text-[var(--positive-text)]">✓ Category spending charts</span>
        </div>
      </div>

      {/* ─── TILE 2 (1-Column): Clean, Non-Nested Connected Pantry ─────── */}
      <div id="pantry" className="card-custom p-6 sm:p-7 rounded-2xl border border-[var(--border)] bg-[var(--card)] flex flex-col justify-between space-y-5">
        <div>
          <div className="w-9 h-9 rounded-xl bg-[var(--sage-tint)] text-[var(--sage)] flex items-center justify-center font-bold mb-3">
            <IconShoppingCart size={20} />
          </div>
          <h3 className="font-serif font-bold text-lg text-[var(--text)] mb-1">
            Connected Pantry
          </h3>
          <p className="text-xs text-[var(--muted)] leading-relaxed">
            Track household supplies with zero clutter.
          </p>

          {/* Clean Item Rows without Heavy Nested Borders */}
          <div className="mt-4 space-y-4">

            {/* Item 1: Coffee Beans */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-[var(--text)] flex items-center gap-1.5">
                  <span>☕</span>
                  <span>Coffee Beans</span>
                </span>
                <span
                  className={`w-20 py-0.5 text-center text-[10px] rounded-md font-bold transition-colors duration-200 ${coffeeStatus === 'out'
                      ? 'bg-[var(--negative-bg)] text-[var(--negative-text)]'
                      : coffeeStatus === 'low'
                        ? 'bg-[var(--warn-bg)] text-[var(--warn-text)]'
                        : 'bg-[var(--positive-bg)] text-[var(--positive-text)]'
                    }`}
                >
                  {coffeeStatus === 'out' ? 'Out' : coffeeStatus === 'low' ? 'Low' : 'Stocked'}
                </span>
              </div>

              {/* Minimal Stock Meter (Left = 0% / Empty -> Right = 100% / Full) */}
              <div className="h-1.5 w-full bg-[var(--canvas)] rounded-full overflow-hidden border border-[var(--border)]/40">
                <div
                  className={`h-full transition-all duration-300 ease-out rounded-full ${coffeeStatus === 'out'
                      ? 'w-[5%] bg-[var(--negative-text)]'
                      : coffeeStatus === 'low'
                        ? 'w-[40%] bg-[var(--oak)]'
                        : 'w-full bg-[var(--sage)]'
                    }`}
                />
              </div>

              {/* Smooth Sliding Pill Segmented Control */}
              <div className="relative flex rounded-lg bg-[var(--canvas)] p-1 text-[11px] font-medium border border-[var(--border)]">
                <div
                  className="absolute top-1 bottom-1 left-1 w-[calc(33.333%-2.67px)] rounded-md bg-[var(--card)] shadow-2xs border border-[var(--border-strong)] transition-transform duration-250 ease-out pointer-events-none"
                  style={{
                    transform: `translateX(${coffeeStatus === 'out' ? 0 : coffeeStatus === 'low' ? 100 : 200}%)`,
                  }}
                />
                <button
                  type="button"
                  onClick={() => setCoffeeStatus('out')}
                  className={`relative z-10 flex-1 py-1 text-center rounded-md transition-colors duration-150 cursor-pointer ${coffeeStatus === 'out'
                      ? 'text-[var(--text)] font-bold'
                      : 'text-[var(--muted)] hover:text-[var(--text)]'
                    }`}
                >
                  Out
                </button>
                <button
                  type="button"
                  onClick={() => setCoffeeStatus('low')}
                  className={`relative z-10 flex-1 py-1 text-center rounded-md transition-colors duration-150 cursor-pointer ${coffeeStatus === 'low'
                      ? 'text-[var(--text)] font-bold'
                      : 'text-[var(--muted)] hover:text-[var(--text)]'
                    }`}
                >
                  Low
                </button>
                <button
                  type="button"
                  onClick={() => setCoffeeStatus('in_stock')}
                  className={`relative z-10 flex-1 py-1 text-center rounded-md transition-colors duration-150 cursor-pointer ${coffeeStatus === 'in_stock'
                      ? 'text-[var(--text)] font-bold'
                      : 'text-[var(--muted)] hover:text-[var(--text)]'
                    }`}
                >
                  Full
                </button>
              </div>
            </div>

            {/* Item 2: Olive Oil */}
            <div className="space-y-2.5 pt-3 border-t border-[var(--border)]/50">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-[var(--text)] flex items-center gap-1.5">
                  <span>🫒</span>
                  <span>Olive Oil (1L)</span>
                </span>
                <span
                  className={`w-20 py-0.5 text-center text-[10px] rounded-md font-bold transition-colors duration-200 ${oilStatus === 'out'
                      ? 'bg-[var(--negative-bg)] text-[var(--negative-text)]'
                      : oilStatus === 'low'
                        ? 'bg-[var(--warn-bg)] text-[var(--warn-text)]'
                        : 'bg-[var(--positive-bg)] text-[var(--positive-text)]'
                    }`}
                >
                  {oilStatus === 'out' ? 'Out' : oilStatus === 'low' ? 'Low' : 'Stocked'}
                </span>
              </div>

              {/* Minimal Stock Meter (Left = 0% / Empty -> Right = 100% / Full) */}
              <div className="h-1.5 w-full bg-[var(--canvas)] rounded-full overflow-hidden border border-[var(--border)]/40">
                <div
                  className={`h-full transition-all duration-300 ease-out rounded-full ${oilStatus === 'out'
                      ? 'w-[5%] bg-[var(--negative-text)]'
                      : oilStatus === 'low'
                        ? 'w-[40%] bg-[var(--oak)]'
                        : 'w-full bg-[var(--sage)]'
                    }`}
                />
              </div>

              {/* Smooth Sliding Pill Segmented Control */}
              <div className="relative flex rounded-lg bg-[var(--canvas)] p-1 text-[11px] font-medium border border-[var(--border)]">
                <div
                  className="absolute top-1 bottom-1 left-1 w-[calc(33.333%-2.67px)] rounded-md bg-[var(--card)] shadow-2xs border border-[var(--border-strong)] transition-transform duration-250 ease-out pointer-events-none"
                  style={{
                    transform: `translateX(${oilStatus === 'out' ? 0 : oilStatus === 'low' ? 100 : 200}%)`,
                  }}
                />
                <button
                  type="button"
                  onClick={() => setOilStatus('out')}
                  className={`relative z-10 flex-1 py-1 text-center rounded-md transition-colors duration-150 cursor-pointer ${oilStatus === 'out'
                      ? 'text-[var(--text)] font-bold'
                      : 'text-[var(--muted)] hover:text-[var(--text)]'
                    }`}
                >
                  Out
                </button>
                <button
                  type="button"
                  onClick={() => setOilStatus('low')}
                  className={`relative z-10 flex-1 py-1 text-center rounded-md transition-colors duration-150 cursor-pointer ${oilStatus === 'low'
                      ? 'text-[var(--text)] font-bold'
                      : 'text-[var(--muted)] hover:text-[var(--text)]'
                    }`}
                >
                  Low
                </button>
                <button
                  type="button"
                  onClick={() => setOilStatus('in_stock')}
                  className={`relative z-10 flex-1 py-1 text-center rounded-md transition-colors duration-150 cursor-pointer ${oilStatus === 'in_stock'
                      ? 'text-[var(--text)] font-bold'
                      : 'text-[var(--muted)] hover:text-[var(--text)]'
                    }`}
                >
                  Full
                </button>
              </div>
            </div>

          </div>
        </div>

        <div className="pt-3 border-t border-[var(--border)] text-[11px] text-[var(--sage)] font-semibold flex items-center gap-1.5">
          <IconCheck size={14} />
          <span>Auto-restocks when grocery bills are logged</span>
        </div>
      </div>

      {/* ─── TILE 3 (1-Column): 1-Tap WhatsApp Nudges ─────────────────── */}
      <div id="nudges" className="card-custom p-6 sm:p-7 rounded-2xl border border-[var(--border)] bg-[var(--card)] flex flex-col justify-between space-y-5">
        <div>
          <div className="w-9 h-9 rounded-xl bg-[#25D366]/15 text-[#25D366] flex items-center justify-center font-bold mb-3">
            <IconBrandWhatsapp size={20} />
          </div>
          <h3 className="font-serif font-bold text-lg text-[var(--text)] mb-1">
            WhatsApp Nudges
          </h3>
          <p className="text-xs text-[var(--muted)] leading-relaxed">
            Eliminate awkward confrontation. Send clean, polite, pre-formatted payment breakdowns in 1 click.
          </p>

          <div className="mt-4 p-3 rounded-xl bg-[var(--canvas)] border border-[var(--border)] space-y-2 text-xs">
            <div className="font-bold text-[#25D366] flex items-center gap-1">
              <span>●</span>
              <span>Pre-Filled Message Preview</span>
            </div>
            <p className="italic text-[11px] text-[var(--text)] bg-[var(--card)] p-2.5 rounded-lg border border-[var(--border)]">
              &ldquo;Hey Omar, here&apos;s your share for Flat 4B (125 MAD for Electricity). Let&apos;s settle up! 👍&rdquo;
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-[var(--border)] text-[11px] text-[var(--muted)] flex items-center gap-1.5 font-medium">
          <span>✓ Includes recipient bank details & RIB</span>
        </div>
      </div>

      {/* ─── TILE 4 (2-Column): Recurring Rent & Settle-Before-Leave Safety Guard ─── */}
      <div id="bills" className="md:col-span-2 card-custom p-6 sm:p-7 rounded-2xl border border-[var(--border)] bg-[var(--card)] flex flex-col justify-between space-y-5">
        <div>
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[var(--oak-tint)] text-[var(--oak)] flex items-center justify-center font-bold">
                <IconShieldLock size={20} />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-[var(--text)]">
                  Recurring Rent & Settle-Before-Leave Guard
                </h3>
                <span className="text-xs text-[var(--muted)]">Automatic rent allocations and ledger protection</span>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-[var(--oak-tint)] text-[var(--oak-hover)] font-semibold font-mono">
              Due in 4 days
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[var(--canvas)] border border-[var(--border)] space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text)]">
                <IconCalendarEvent size={16} className="text-[var(--oak)]" />
                <span>Monthly Rent Allocation</span>
              </div>
              <div className="font-mono tabular-nums font-bold text-2xl text-[var(--text)]">
                6,000.00 <span className="text-xs text-[var(--muted)] font-normal">MAD / mo</span>
              </div>
              <p className="text-[11px] text-[var(--muted)]">
                Split 4 ways: 1,500.00 MAD automatically debited to monthly roommate tabs on the 1st of every month.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[var(--sage-tint)]/60 border border-[var(--sage)]/30 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--positive-text)]">
                <IconShieldLock size={16} />
                <span>Settle-Before-Leave Safety Guard</span>
              </div>
              <p className="text-[11px] text-[var(--text)] leading-relaxed">
                Protecting all roommates: members cannot exit the space until their active net balance is <strong>0.00 MAD</strong>. Zero unpaid rent or surprise debt.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-[var(--border)] flex flex-wrap items-center gap-4 text-xs font-medium text-[var(--muted)]">
          <span className="text-[var(--positive-text)]">✓ Zero unpaid flatmate debts</span>
          <span className="text-[var(--positive-text)]">✓ 1-click space invite links & 6-digit codes</span>
          <span className="text-[var(--positive-text)]">✓ Role-based permissions</span>
        </div>
      </div>

    </div>
  );
};
