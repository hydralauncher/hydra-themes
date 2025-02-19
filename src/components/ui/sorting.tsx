"use client"

import { Check, ChevronsUpDown, Heart, Flame, CalendarArrowDown, CalendarArrowUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { sortThemes } from "@/stores/sort"

const languages = [
    { label: "Newest", icon: <CalendarArrowUp />, value: "newest" },
    { label: "Oldest", icon: <CalendarArrowDown />, value: "oldest" },
    { label: "Most Popular", icon: <Flame />, value: "most-popular" },
    { label: "Most Favorited", icon: <Heart />, value: "most-favorited" },
] as const

export const ThemeSorting = () => {

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={cn(
            "w-[180px] justify-between",
            !sortThemes.get() && "text-muted-foreground font-medium"
          )}
        >
          {sortThemes.get()
            ? languages.find(
                (sort) => sort.value === sortThemes.get()
              )?.label
            : "Sort by..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[180px] p-0">
        <Command>
          <CommandList>
            <CommandEmpty>No sort found.</CommandEmpty>
            <CommandGroup>
              {languages.map((sort) => (
                <CommandItem
                  className={cn(
                    "flex flex-row items-center gap-2",
                    sort.value === sortThemes.get() && "bg-muted/80 transition-all duration-200"
                  )}
                  value={sort.label}
                  key={sort.value}
                  onSelect={() => {
                    const currentValue = sortThemes.get();
                    if (currentValue === sort.value) {
                      sortThemes.set(undefined);
                    } else {
                      sortThemes.set(sort.value);
                    }
                  }}
                >
                  {sort.icon}
                  {sort.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      sort.value === sortThemes.get()
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
