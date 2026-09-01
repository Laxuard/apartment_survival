import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { IconCalendar, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';


interface DatePickerProps {
  value: string; // ISO format or "YYYY-MM-DD"
  onChange: (dateStr: string) => void;
  className?: string;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const parsedDate = value ? new Date(value) : new Date();
  const validDate = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;

  const [viewYear, setViewYear] = useState(validDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(validDate.getMonth());

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Compute days in current view month
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const handleSelectDay = (day: number) => {
    const mStr = String(viewMonth + 1).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    const dateStr = `${viewYear}-${mStr}-${dStr}`;
    onChange(dateStr);
    setIsOpen(false);
  };

  const formattedDisplay = validDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const isSelected = (day: number) => {
    return (
      validDate.getDate() === day &&
      validDate.getMonth() === viewMonth &&
      validDate.getFullYear() === viewYear
    );
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === viewMonth &&
      today.getFullYear() === viewYear
    );
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-[var(--canvas)] border border-[var(--border)] text-xs text-[var(--text)] hover:border-[var(--oak)]/60 focus:outline-none transition-all cursor-pointer shadow-2xs ${className}`}
      >
        <div className="flex items-center gap-2.5 font-medium">
          <IconCalendar size={15} className="text-[var(--oak)] shrink-0" />
          <span>{formattedDisplay}</span>
        </div>
        <span className="text-[10px] text-[var(--muted)] uppercase font-mono">Change</span>
      </PopoverTrigger>

      <PopoverContent className="w-[280px] p-3.5 bg-[var(--card)] border border-[var(--border-strong)] rounded-2xl shadow-xl space-y-3 z-50">
        {/* Month Navigation */}
        <div className="flex items-center justify-between pb-1 border-b border-[var(--border)]">
          <span className="font-semibold text-xs text-[var(--text)]">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-lg hover:bg-[var(--canvas)] text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
            >
              <IconChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-lg hover:bg-[var(--canvas)] text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
            >
              <IconChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Days of Week */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {DAYS_OF_WEEK.map((d) => (
            <span key={d} className="text-[10px] font-bold text-[var(--muted)] uppercase">
              {d}
            </span>
          ))}
        </div>

        {/* Calendar Day Grid */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {/* Leading padding days */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <span
              key={`prev-${i}`}
              className="h-7 flex items-center justify-center text-[11px] text-[var(--muted)]/40 font-mono"
            >
              {daysInPrevMonth - firstDayOfWeek + i + 1}
            </span>
          ))}

          {/* Actual days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const selected = isSelected(day);
            const today = isToday(day);

            return (
              <button
                key={day}
                type="button"
                onClick={() => handleSelectDay(day)}
                className={`h-7 w-7 mx-auto flex items-center justify-center rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  selected
                    ? 'bg-[var(--oak)] text-white font-bold shadow-xs'
                    : today
                    ? 'border border-[var(--oak)]/60 text-[var(--oak)] font-semibold bg-[var(--oak-tint)]/20'
                    : 'text-[var(--text)] hover:bg-[var(--canvas)]'
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* Quick action: Today */}
        <div className="pt-2 border-t border-[var(--border)] flex justify-between items-center text-[11px]">
          <button
            type="button"
            onClick={() => {
              const now = new Date();
              setViewYear(now.getFullYear());
              setViewMonth(now.getMonth());
              handleSelectDay(now.getDate());
            }}
            className="text-[var(--oak)] font-medium hover:underline cursor-pointer"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
          >
            Close
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
