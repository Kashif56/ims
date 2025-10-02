import * as React from 'react';
import { CalendarIcon } from 'lucide-react';
import { addDays, format, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, subMonths, subYears } from 'date-fns';
import { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export type DateRangePreset = {
  label: string;
  getValue: () => DateRange;
};

const dateRangePresets: DateRangePreset[] = [
  {
    label: 'Today',
    getValue: () => ({
      from: new Date(),
      to: new Date(),
    }),
  },
  {
    label: 'Yesterday',
    getValue: () => ({
      from: subDays(new Date(), 1),
      to: subDays(new Date(), 1),
    }),
  },
  {
    label: 'Last 7 Days',
    getValue: () => ({
      from: subDays(new Date(), 6),
      to: new Date(),
    }),
  },
  {
    label: 'Last 30 Days',
    getValue: () => ({
      from: subDays(new Date(), 29),
      to: new Date(),
    }),
  },
  {
    label: 'This Month',
    getValue: () => ({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    }),
  },
  {
    label: 'Last Month',
    getValue: () => {
      const lastMonth = subMonths(new Date(), 1);
      return {
        from: startOfMonth(lastMonth),
        to: endOfMonth(lastMonth),
      };
    },
  },
  {
    label: 'This Year',
    getValue: () => ({
      from: startOfYear(new Date()),
      to: endOfYear(new Date()),
    }),
  },
  {
    label: 'Last Year',
    getValue: () => {
      const lastYear = subYears(new Date(), 1);
      return {
        from: startOfYear(lastYear),
        to: endOfYear(lastYear),
      };
    },
  },
  {
    label: 'All Time',
    getValue: () => ({
      from: undefined,
      to: undefined,
    }),
  },
];

interface DateRangePickerProps {
  className?: string;
  date?: DateRange;
  onDateChange?: (date: DateRange | undefined) => void;
}

export function DateRangePicker({ className, date, onDateChange }: DateRangePickerProps) {
  const [selectedPreset, setSelectedPreset] = React.useState<string>('All Time');
  const [isOpen, setIsOpen] = React.useState(false);

  const handlePresetChange = (presetLabel: string) => {
    setSelectedPreset(presetLabel);
    const preset = dateRangePresets.find((p) => p.label === presetLabel);
    if (preset) {
      const newRange = preset.getValue();
      onDateChange?.(newRange);
      if (presetLabel !== 'Custom') {
        setIsOpen(false);
      }
    }
  };

  const handleDateSelect = (newDate: DateRange | undefined) => {
    onDateChange?.(newDate);
    setSelectedPreset('Custom');
  };

  const formatDateRange = () => {
    if (!date?.from) {
      return <span>All Time</span>;
    }
    if (date.from && !date.to) {
      return format(date.from, 'LLL dd, y');
    }
    if (date.from && date.to) {
      return (
        <>
          {format(date.from, 'LLL dd, y')} - {format(date.to, 'LLL dd, y')}
        </>
      );
    }
    return <span>Pick a date range</span>;
  };

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex">
            <div className="border-r p-3 space-y-2">
              <div className="text-sm font-semibold mb-2">Presets</div>
              <div className="flex flex-col space-y-1">
                {dateRangePresets.map((preset) => (
                  <Button
                    key={preset.label}
                    variant={selectedPreset === preset.label ? 'default' : 'ghost'}
                    className="justify-start text-sm h-8"
                    onClick={() => handlePresetChange(preset.label)}
                  >
                    {preset.label}
                  </Button>
                ))}
                <Button
                  variant={selectedPreset === 'Custom' ? 'default' : 'ghost'}
                  className="justify-start text-sm h-8"
                  onClick={() => setSelectedPreset('Custom')}
                >
                  Custom
                </Button>
              </div>
            </div>
            <div className="p-3">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={handleDateSelect}
                numberOfMonths={2}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
