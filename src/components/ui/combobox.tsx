'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from './command';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

export interface ComboboxOption {
  value: string;
  label: string;
  sublabel?: string;
  badge?: string;
  icon?: React.ReactNode;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  actionText?: string;
  onActionClick?: () => void;
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = 'Select option...',
  searchPlaceholder = 'Search...',
  emptyText = 'No options found.',
  error,
  disabled = false,
  className,
  actionText,
  onActionClick,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'flex h-9 w-full items-center justify-between rounded-none border bg-surface px-3 py-2 text-xs transition-colors focus:outline-none focus:ring-1 focus:ring-foreground disabled:cursor-not-allowed disabled:opacity-50 text-left',
            error ? 'border-danger focus:ring-danger' : 'border-border focus:border-foreground',
            !selectedOption && 'text-muted',
            className
          )}
        >
          <span className="truncate">
            {selectedOption ? (
              <span className="text-foreground font-medium">
                {selectedOption.label}
                {selectedOption.sublabel && (
                  <span className="text-muted font-normal ml-1.5 text-[11px] font-mono">
                    [{selectedOption.sublabel}]
                  </span>
                )}
              </span>
            ) : (
              placeholder
            )}
          </span>
          <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-[280px] p-0 rounded-none shadow-2xl border border-border" align="start">
        <Command className="rounded-none">
          <CommandInput placeholder={searchPlaceholder} className="rounded-none text-xs" />
          <CommandList className="rounded-none">
            <CommandEmpty className="py-4 text-xs font-mono text-muted">{emptyText}</CommandEmpty>
            <CommandGroup className="rounded-none">
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={`${option.label} ${option.sublabel || ''} ${option.value}`}
                  onSelect={() => {
                    onChange(option.value === value ? '' : option.value);
                    setOpen(false);
                  }}
                  className="flex items-center justify-between px-2.5 py-2 rounded-none cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    {option.icon}
                    <div className="truncate">
                      <p className="font-semibold text-foreground text-xs truncate">{option.label}</p>
                      {option.sublabel && (
                        <p className="text-[10px] text-muted font-mono truncate">{option.sublabel}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {option.badge && (
                      <span className="text-[10px] bg-white text-zinc-800 px-1.5 py-0.5 rounded-none font-mono border border-border shadow-xs">
                        {option.badge}
                      </span>
                    )}
                    <Check
                      className={cn(
                        'h-3.5 w-3.5 text-foreground transition-opacity',
                        value === option.value ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            {actionText && onActionClick && (
              <>
                <CommandSeparator />
                <div className="p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      onActionClick();
                    }}
                    className="flex w-full items-center gap-1.5 px-2 py-1.5 rounded-none text-xs font-semibold text-foreground hover:bg-zinc-100 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 shrink-0" />
                    <span>{actionText.replace(/^\+?\s*/, '')}</span>
                  </button>
                </div>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
