import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useThemeStore } from '@/stores/useThemeStore';
import { IconBuildingCommunity, IconMoon, IconSun } from '@tabler/icons-react';
import React from 'react';
import { Link } from 'react-router-dom';

export const LandingNavbar: React.FC = () => {
  const { mode, setMode } = useThemeStore();

  const toggleTheme = () => {
    setMode(mode === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--card)]/90 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Brand Mark */}
        <Link to="/" className="flex items-center space-x-3 text-decoration-none group">
          <div className="w-9 h-9 rounded-xl bg-[var(--oak-tint)] text-[var(--oak)] flex items-center justify-center font-bold border border-[var(--oak)]/30 shadow-2xs group-hover:scale-105 transition-transform">
            <IconBuildingCommunity size={20} />
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-bold text-base tracking-tight text-[var(--text)]">Apartment Survival</span>
            <span className="text-[10px] text-[var(--muted)] font-medium">Flat 4B &bull; Shared Living</span>
          </div>
        </Link>

        {/* Navigation - Clean text links without rigid outline boxes */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 text-xs font-semibold text-[var(--muted)]">
          <a
            href="#simulator"
            className="px-3 py-1.5 rounded-lg hover:text-[var(--text)] hover:bg-[var(--canvas)] transition-colors"
          >
            Split Engine
          </a>
          <a
            href="#pantry"
            className="px-3 py-1.5 rounded-lg hover:text-[var(--text)] hover:bg-[var(--canvas)] transition-colors"
          >
            Smart Pantry
          </a>
          <a
            href="#bills"
            className="px-3 py-1.5 rounded-lg hover:text-[var(--text)] hover:bg-[var(--canvas)] transition-colors"
          >
            Rent & Bills
          </a>
          <a
            href="#nudges"
            className="px-3 py-1.5 rounded-lg hover:text-[var(--text)] hover:bg-[var(--canvas)] transition-colors"
          >
            WhatsApp Nudges
          </a>
          <a
            href="#faq"
            className="px-3 py-1.5 rounded-lg hover:text-[var(--text)] hover:bg-[var(--canvas)] transition-colors"
          >
            FAQ
          </a>
        </nav>

        {/* Right Action Bar */}
        <div className="flex items-center space-x-3">
          {/* Light / Dark Mode Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={toggleTheme}
                className="w-9 h-9 rounded-xl border border-[var(--border-strong)] bg-[var(--canvas)] text-[var(--muted)] hover:text-[var(--text)] flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Toggle theme mode"
              >
                {mode === 'dark' ? <IconSun size={17} /> : <IconMoon size={17} />}
              </button>
            </TooltipTrigger>
            <TooltipContent>Toggle theme mode</TooltipContent>
          </Tooltip>

          {/* Sign In Link */}
          <Link
            to="/login"
            className="text-xs font-semibold text-[var(--muted)] hover:text-[var(--text)] px-2.5 py-1.5 rounded-lg transition-colors hidden sm:inline-block"
          >
            Sign In
          </Link>

          {/* Setup Flat CTA */}
          <Link to="/onboarding">
            <Button
              className="btn-tactile bg-[var(--oak)] hover:bg-[var(--oak-hover)] text-white text-xs font-semibold px-4 py-2 h-9 rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Set up flat</span>
              <span>→</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
