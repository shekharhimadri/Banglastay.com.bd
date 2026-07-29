import { useState, useMemo, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface DateRangePickerProps {
  checkIn: Date | null;
  checkOut: Date | null;
  onChange: (checkIn: Date | null, checkOut: Date | null) => void;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function isSameDay(a: Date | null, b: Date | null) {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isInRange(day: Date, checkIn: Date | null, checkOut: Date | null) {
  if (!checkIn || !checkOut) return false;
  return day > checkIn && day < checkOut;
}

function buildMonthGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  return cells;
}

export function DateRangePicker({ checkIn, checkOut, onChange }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [secondMonth, setSecondMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 1);
  });
  const [hovered, setHovered] = useState<Date | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  function handleDayClick(day: Date) {
    if (day < today) return;
    if (!checkIn || (checkIn && checkOut)) {
      onChange(day, null);
    } else if (day <= checkIn) {
      onChange(day, null);
    } else {
      onChange(checkIn, day);
    }
  }

  function shiftMonth(delta: number) {
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + delta, 1));
    setSecondMonth(new Date(secondMonth.getFullYear(), secondMonth.getMonth() + delta, 1));
  }

  function renderMonth(year: number, month: number) {
    const cells = buildMonthGrid(year, month);
    return (
      <div className="flex-1 min-w-[260px]">
        <div className="flex items-center justify-between px-1 mb-3">
          <span className="text-sm font-semibold text-stone-800">{MONTHS[month]} {year}</span>
        </div>
        <div className="grid grid-cols-7 gap-y-1 mb-1">
          {DAYS.map((d) => (
            <div key={d} className="text-[10px] font-semibold text-stone-400 text-center">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-1">
          {cells.map((day, i) => {
            if (!day) return <div key={i} />;
            const isPast = day < today;
            const isCheckIn = isSameDay(day, checkIn);
            const isCheckOut = isSameDay(day, checkOut);
            const isMid = isInRange(day, checkIn, checkOut) || (checkIn && !checkOut && hovered && day > checkIn && day < hovered);
            return (
              <button
                key={i}
                disabled={isPast}
                onClick={() => handleDayClick(day)}
                onMouseEnter={() => setHovered(day)}
                onMouseLeave={() => setHovered(null)}
                className={`relative h-9 w-9 mx-auto flex items-center justify-center text-sm rounded-full transition-colors ${
                  isCheckIn || isCheckOut
                    ? 'bg-green-600 text-white font-semibold'
                    : isMid
                    ? 'bg-green-100 text-green-800'
                    : isPast
                    ? 'text-stone-300 cursor-not-allowed'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const displayText = checkIn && checkOut
    ? `${checkIn.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} — ${checkOut.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
    : checkIn
    ? `${checkIn.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} — Check-out`
    : 'Add dates';

  return (
    <div className="relative flex-1" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 md:border-r md:border-stone-200 text-left hover:bg-stone-50/50 rounded-xl md:rounded-none transition-colors"
      >
        <Calendar className="w-5 h-5 text-green-600 shrink-0" />
        <div className="flex-1">
          <label className="block text-[11px] font-semibold text-stone-400 uppercase tracking-wide">Check-in — Check-out</label>
          <span className={`block text-sm font-medium ${checkIn ? 'text-stone-800' : 'text-stone-400'}`}>{displayText}</span>
        </div>
      </button>
      {open && (
        <div className="absolute top-full mt-2 left-0 z-50 bg-white rounded-2xl shadow-2xl border border-stone-100 p-5 flex gap-4">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            className="absolute left-3 top-3 w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center"
          >
            <ChevronLeft className="w-4 h-4 text-stone-600" />
          </button>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            className="absolute right-3 top-3 w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center"
          >
            <ChevronRight className="w-4 h-4 text-stone-600" />
          </button>
          {renderMonth(viewMonth.getFullYear(), viewMonth.getMonth())}
          <div className="hidden sm:block w-px bg-stone-100" />
          <div className="hidden sm:block">{renderMonth(secondMonth.getFullYear(), secondMonth.getMonth())}</div>
        </div>
      )}
    </div>
  );
}
