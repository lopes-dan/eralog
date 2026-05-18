import * as React from 'react';
import { format, parseISO, isValid, setYear, setMonth, getYear, getMonth } from 'date-fns';
import { CalendarIcon, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Calendar } from './calendar';
import { cn } from '@/lib/utils';

type Props = {
  value: string;
  onChange: (iso: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  /** Earliest selectable year. Defaults to 1900. */
  fromYear?: number;
  /** Latest selectable year. Defaults to current year + 5. */
  toYear?: number;
};

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

type View = 'days' | 'years' | 'months';

export function DatePicker({
  value,
  onChange,
  placeholder = 'Pick a date',
  required,
  className,
  fromYear = 1900,
  toYear = new Date().getFullYear() + 5,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [view, setView] = React.useState<View>('days');

  const parsed = value ? parseISO(value) : undefined;
  const valid = parsed && isValid(parsed);

  // The month currently displayed in the calendar grid (independent of selected value)
  const [month, setMonthState] = React.useState<Date>(valid ? parsed! : new Date());

  // Sync the displayed month when the value changes from outside
  React.useEffect(() => {
    if (valid) setMonthState(parsed!);
  }, [value]);

  // Reset to day view whenever the popover closes
  React.useEffect(() => {
    if (!open) setView('days');
  }, [open]);

  function handleSelect(day: Date | undefined) {
    if (day) {
      onChange(format(day, 'yyyy-MM-dd'));
      setOpen(false);
    }
  }

  function pickYear(y: number) {
    setMonthState(setYear(month, y));
    setView('months');
  }

  function pickMonth(m: number) {
    setMonthState(setMonth(month, m));
    setView('days');
  }

  const years = React.useMemo(() => {
    const arr: number[] = [];
    for (let y = toYear; y >= fromYear; y--) arr.push(y);
    return arr;
  }, [fromYear, toYear]);

  const currentYear = getYear(month);
  const currentMonth = getMonth(month);
  const todayYear = getYear(new Date());

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex h-10 w-full items-center gap-2 rounded-lg border border-ink-700 bg-ink-800 px-3 text-sm transition-colors',
            'hover:border-ink-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember-500/50',
            valid ? 'text-ink-100' : 'text-ink-500',
            className
          )}
          aria-required={required}
        >
          <CalendarIcon className="w-4 h-4 text-ink-500 shrink-0" />
          <span className="flex-1 text-left truncate">
            {valid ? format(parsed!, 'MMM d, yyyy') : placeholder}
          </span>
        </button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-auto p-0">
        {view === 'days' && (
          <div className="p-3">
            {/* Custom caption: clickable label + space-between arrows */}
            <div className="relative flex items-center justify-center h-8 mb-2 px-1">
              <button
                type="button"
                onClick={() => setView('years')}
                className="inline-flex items-center gap-1 h-8 px-3 rounded-md text-sm font-medium text-ink-100 hover:bg-ink-700 transition-colors"
              >
                {format(month, 'MMMM yyyy')}
                <ChevronDown className="w-3.5 h-3.5 text-ink-400" />
              </button>
              <button
                type="button"
                onClick={() => setMonthState(setMonth(month, currentMonth - 1))}
                className="absolute left-0 h-7 w-7 inline-flex items-center justify-center rounded-md border border-ink-700 bg-ink-800 hover:bg-ink-700 hover:border-ink-600 text-ink-200 transition-colors"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setMonthState(setMonth(month, currentMonth + 1))}
                className="absolute right-0 h-7 w-7 inline-flex items-center justify-center rounded-md border border-ink-700 bg-ink-800 hover:bg-ink-700 hover:border-ink-600 text-ink-200 transition-colors"
                aria-label="Next month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <Calendar
              mode="single"
              selected={valid ? parsed : undefined}
              onSelect={handleSelect}
              month={month}
              onMonthChange={setMonthState}
              weekStartsOn={1}
              fixedWeeks
              showOutsideDays
              // We render our own caption above, so hide DayPicker's
              classNames={{
                month_caption: 'hidden',
                nav: 'hidden',
              }}
            />
          </div>
        )}

        {view === 'years' && (
          <div className="p-3 w-[260px]">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-sm font-medium text-ink-100">Select year</span>
              <button
                type="button"
                onClick={() => setView('days')}
                className="text-xs text-ink-400 hover:text-ink-100 transition-colors"
              >
                Cancel
              </button>
            </div>
            <div className="grid grid-cols-4 gap-1.5 max-h-[260px] overflow-y-auto pr-1">
              {years.map(y => (
                <button
                  key={y}
                  type="button"
                  onClick={() => pickYear(y)}
                  className={cn(
                    'h-9 rounded-md text-sm transition-colors',
                    y === currentYear
                      ? 'bg-ember-500 text-white font-semibold'
                      : y === todayYear
                      ? 'text-ember-400 border border-ember-500/40 hover:bg-ink-700'
                      : 'text-ink-200 hover:bg-ink-700'
                  )}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>
        )}

        {view === 'months' && (
          <div className="p-3 w-[260px]">
            <div className="flex items-center justify-between mb-3 px-1">
              <button
                type="button"
                onClick={() => setView('years')}
                className="inline-flex items-center gap-1 text-sm font-medium text-ink-100 hover:text-ember-400 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                {currentYear}
              </button>
              <button
                type="button"
                onClick={() => setView('days')}
                className="text-xs text-ink-400 hover:text-ink-100 transition-colors"
              >
                Cancel
              </button>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {MONTHS.map((label, i) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => pickMonth(i)}
                  className={cn(
                    'h-10 rounded-md text-sm transition-colors',
                    i === currentMonth
                      ? 'bg-ember-500 text-white font-semibold'
                      : 'text-ink-200 hover:bg-ink-700'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
