import * as React from 'react';
import { DayPicker } from 'react-day-picker';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      fixedWeeks
      className={cn('p-3', className)}
      classNames={{
        months: 'flex flex-col',
        month: 'space-y-3',
        // Caption: title centered, arrows pulled in next to it
        month_caption: 'flex justify-center items-center h-7 relative px-8',
        caption_label: 'text-sm font-semibold text-ink-200',
        nav: 'absolute inset-x-0 top-0 h-7 flex items-center justify-between pointer-events-none',
        button_previous: cn(
          'h-7 w-7 rounded-lg border border-ink-700 bg-ink-800/80 text-ink-300',
          'hover:bg-ink-700 hover:text-ink-100 hover:border-ink-600',
          'flex items-center justify-center transition-colors pointer-events-auto'
        ),
        button_next: cn(
          'h-7 w-7 rounded-lg border border-ink-700 bg-ink-800/80 text-ink-300',
          'hover:bg-ink-700 hover:text-ink-100 hover:border-ink-600',
          'flex items-center justify-center transition-colors pointer-events-auto'
        ),
        month_grid: 'w-full border-collapse',
        weekdays: 'flex',
        weekday: 'w-9 text-[11px] font-medium text-ink-600 text-center pb-1',
        weeks: 'space-y-0.5',
        week: 'flex',
        day: 'relative p-0',
        day_button: cn(
          'h-9 w-9 text-sm rounded-lg font-normal text-ink-300 transition-colors',
          'hover:bg-ink-700 hover:text-ink-100',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember-500/50',
          'aria-selected:opacity-100'
        ),
        selected:
          '[&>button]:bg-ember-500 [&>button]:text-white [&>button]:hover:bg-ember-400 [&>button]:font-semibold',
        today: '[&>button]:border [&>button]:border-ember-500/40 [&>button]:text-ember-400',
        outside: '[&>button]:text-ink-700 [&>button]:hover:text-ink-500',
        disabled: '[&>button]:text-ink-800 [&>button]:pointer-events-none',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === 'left' ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          ),
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };
