"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";

export interface ThemeSortingProps {
  options: {
    label: string;
    icon: React.ReactNode;
    value: string;
  }[];
  selectedValue: string;
  onSelect: (value: string) => void;
}

export function ThemeSorting({
  options,
  selectedValue,
  onSelect,
}: ThemeSortingProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={cn(
            "w-[180px] justify-between",
            !selectedValue && "text-muted-foreground font-medium",
          )}
        >
          {selectedValue
            ? options.find((sort) => sort.value === selectedValue)?.label
            : "Sort by..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[180px] p-0">
        <Command>
          <CommandList>
            <CommandEmpty>No sort found.</CommandEmpty>
            <CommandGroup>
              {options.map((sort) => (
                <CommandItem
                  className={cn(
                    "flex flex-row items-center gap-2",
                    sort.value === selectedValue &&
                      "bg-muted/80 transition-all duration-200",
                  )}
                  value={sort.label}
                  key={sort.value}
                  onSelect={() => {
                    onSelect(sort.value);
                    setOpen(false);
                  }}
                >
                  {sort.icon}
                  {sort.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      sort.value === selectedValue
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
