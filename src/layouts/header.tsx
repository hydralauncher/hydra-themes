import Logo from "@/assets/hydra-logo.svg";
import Github from "@/assets/github.svg";
import { ModeToggle } from "@/components/ui/theme-mode";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { searchQuery } from "@/stores/search";
import { useCallback, useRef, useState } from "react";
import { debounce } from "lodash-es";

export function Header() {
  const debouncedSearch = useRef(
    debounce((value: string) => {
      searchQuery.set({
        value,
        page: 1,
      });
    }, 300),
  ).current;

  const [search, setSearch] = useState("");

  const handleSearch = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setSearch(value);

      debouncedSearch.cancel();
      debouncedSearch(value);
    },
    [],
  );

  return (
    <header className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-12 w-full max-w-screen-2xl flex-row items-center justify-between px-4 xs:h-14">
        <a href="/" className="flex items-center gap-2">
          <img
            src={Logo.src}
            alt="Hydra Logo"
            width={28}
            height={28}
            decoding="async"
            loading="eager"
            className="dark:invert"
          />
          <span className="hidden text-xl font-semibold md:flex">
            Theme Store
          </span>
        </a>

        <div className="flex items-center">
          <div className="mr-2 items-center gap-2">
            <div className="relative hidden w-full sm:flex">
              <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={handleSearch}
                className="h-8 rounded-lg bg-muted/50 pl-10 text-sm text-muted-foreground xs:w-64"
                placeholder="Search a theme..."
              />
            </div>
          </div>

          <a
            href="https://github.com/hydralauncher/hydra-themes"
            className={`${buttonVariants({ variant: "ghost", size: "icon" })} size-8 rounded-lg`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={Github.src}
              alt="Source Code"
              width={19}
              height={19}
              decoding="async"
              loading="eager"
              className="transition-all duration-500 dark:invert"
            />
          </a>

          {/* <I18nSelector /> */}

          <ModeToggle />

          <a
            href="https://github.com/hydralauncher/hydra-themes/pulls"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "ml-2 h-8 rounded-lg hidden sm:flex",
            )}
          >
            <Upload className="size-4" />
            <span className="text-sm">Upload Theme</span>
          </a>
        </div>
      </div>
    </header>
  );
}
