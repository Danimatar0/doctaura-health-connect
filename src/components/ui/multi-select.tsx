import * as React from "react";
import { Check, ChevronsUpDown, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface MultiSelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  group?: string;
}

export interface MultiSelectProps {
  /** Available options */
  options: MultiSelectOption[];
  /** Currently selected values */
  value?: (string | number)[];
  /** Callback when selection changes */
  onChange?: (value: (string | number)[]) => void;
  /** Placeholder text when nothing is selected */
  placeholder?: string;
  /** Search placeholder */
  searchPlaceholder?: string;
  /** Maximum number of items that can be selected */
  maxSelected?: number;
  /** Whether the select is disabled */
  disabled?: boolean;
  /** Custom class name */
  className?: string;
  /** Whether to show search input */
  searchable?: boolean;
  /** Label for the select */
  label?: string;
  /** Error message */
  error?: string;
  /** Helper text */
  helperText?: string;
  /** Whether to show selected items as badges */
  showBadges?: boolean;
  /** Maximum badges to show before collapsing */
  maxBadges?: number;
  /** Empty state message */
  emptyMessage?: string;
  /** Loading state */
  isLoading?: boolean;
}

export const MultiSelect = React.forwardRef<HTMLButtonElement, MultiSelectProps>(
  (
    {
      options,
      value = [],
      onChange,
      placeholder = "Select items...",
      searchPlaceholder = "Search...",
      maxSelected,
      disabled = false,
      className,
      searchable = true,
      label,
      error,
      helperText,
      showBadges = true,
      maxBadges = 3,
      emptyMessage = "No options found.",
      isLoading = false,
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");

    const selectedOptions = options.filter((opt) => value.includes(opt.value));

    const filteredOptions = React.useMemo(() => {
      if (!searchQuery) return options;
      const query = searchQuery.toLowerCase();
      return options.filter((opt) =>
        opt.label.toLowerCase().includes(query)
      );
    }, [options, searchQuery]);

    // Group options if they have group property
    const groupedOptions = React.useMemo(() => {
      const groups: Record<string, MultiSelectOption[]> = {};
      filteredOptions.forEach((opt) => {
        const group = opt.group || "";
        if (!groups[group]) groups[group] = [];
        groups[group].push(opt);
      });
      return groups;
    }, [filteredOptions]);

    const handleToggle = (optionValue: string | number) => {
      if (disabled) return;

      const isSelected = value.includes(optionValue);
      let newValue: (string | number)[];

      if (isSelected) {
        newValue = value.filter((v) => v !== optionValue);
      } else {
        if (maxSelected && value.length >= maxSelected) {
          return; // Don't add if max reached
        }
        newValue = [...value, optionValue];
      }

      onChange?.(newValue);
    };

    const handleRemove = (optionValue: string | number, e: React.MouseEvent) => {
      e.stopPropagation();
      if (disabled) return;
      onChange?.(value.filter((v) => v !== optionValue));
    };

    const handleClearAll = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (disabled) return;
      onChange?.([]);
    };

    const displayValue = () => {
      if (selectedOptions.length === 0) {
        return <span className="text-muted-foreground">{placeholder}</span>;
      }

      if (!showBadges) {
        return (
          <span>
            {selectedOptions.length} item{selectedOptions.length !== 1 ? "s" : ""} selected
          </span>
        );
      }

      const visibleOptions = selectedOptions.slice(0, maxBadges);
      const remainingCount = selectedOptions.length - maxBadges;

      return (
        <div className="flex flex-wrap gap-1">
          {visibleOptions.map((opt) => (
            <Badge
              key={opt.value}
              variant="secondary"
              className="px-1.5 py-0 text-xs font-normal"
            >
              {opt.label}
              <button
                type="button"
                className="ml-1 hover:text-destructive"
                onClick={(e) => handleRemove(opt.value, e)}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {remainingCount > 0 && (
            <Badge variant="outline" className="px-1.5 py-0 text-xs font-normal">
              +{remainingCount} more
            </Badge>
          )}
        </div>
      );
    };

    return (
      <div className={cn("space-y-2", className)}>
        {label && (
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
          </label>
        )}

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              ref={ref}
              variant="outline"
              role="combobox"
              aria-expanded={open}
              disabled={disabled}
              className={cn(
                "w-full justify-between h-auto min-h-10 px-3 py-2",
                error && "border-destructive",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="flex-1 text-left">{displayValue()}</div>
              <div className="flex items-center gap-1 ml-2">
                {selectedOptions.length > 0 && (
                  <button
                    type="button"
                    className="p-0.5 hover:bg-muted rounded"
                    onClick={handleClearAll}
                  >
                    <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  </button>
                )}
                <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
            {searchable && (
              <div className="flex items-center border-b px-3">
                <Search className="h-4 w-4 shrink-0 opacity-50" />
                <Input
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
            )}
            <ScrollArea className="max-h-60">
              {isLoading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Loading...
                </div>
              ) : filteredOptions.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  {emptyMessage}
                </div>
              ) : (
                <div className="p-1">
                  {Object.entries(groupedOptions).map(([group, groupOptions]) => (
                    <div key={group || "ungrouped"}>
                      {group && (
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                          {group}
                        </div>
                      )}
                      {groupOptions.map((option) => {
                        const isSelected = value.includes(option.value);
                        const isDisabled =
                          option.disabled ||
                          (!isSelected && maxSelected && value.length >= maxSelected);

                        return (
                          <div
                            key={option.value}
                            className={cn(
                              "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                              isSelected && "bg-accent",
                              isDisabled
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:bg-accent hover:text-accent-foreground"
                            )}
                            onClick={() => !isDisabled && handleToggle(option.value)}
                          >
                            <div
                              className={cn(
                                "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                isSelected
                                  ? "bg-primary text-primary-foreground"
                                  : "opacity-50"
                              )}
                            >
                              {isSelected && <Check className="h-3 w-3" />}
                            </div>
                            <span>{option.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            {maxSelected && (
              <div className="border-t px-3 py-2 text-xs text-muted-foreground">
                {value.length} / {maxSelected} selected
              </div>
            )}
          </PopoverContent>
        </Popover>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {helperText && !error && (
          <p className="text-xs text-muted-foreground">{helperText}</p>
        )}
      </div>
    );
  }
);

MultiSelect.displayName = "MultiSelect";

export default MultiSelect;
