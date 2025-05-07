import { ThemeCard } from "./theme-card";
import { CalendarArrowDown, CalendarArrowUp, Frown } from "lucide-react";
import { Button } from "./button";
import { ThemeSorting } from "./sorting";
import { ThemePagination } from "./theme-pagination";
import type { Theme } from "@/lib/schemas/theme";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Heart, Flame } from "lucide-react";
import { searchQuery } from "@/stores/search";
import { useStore } from "@nanostores/react";
import { compactNumber } from "@/lib/helpers";
import { api } from "@/lib/api";

export function ThemeList() {
  const [sort, setSort] = useState("newest");
  const search = useStore(searchQuery);

  const [themes, setThemes] = useState<Theme[]>([]);
  const [themeCount, setThemeCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const searchParams = new URLSearchParams({
      page: search.page.toString(),
      sort: sort,
      query: search.value,
    });

    api
      .get<{ edges: Theme[]; count: number }>(
        `themes?${searchParams.toString()}`,
      )
      .json()
      .then((response) => {
        setThemes(response.edges);
        setThemeCount(response.count);
      })
      .finally(() => setIsLoading(false));
  }, [search.page, search.value, sort]);

  const handlePageChange = useCallback((page: number) => {
    searchQuery.set({
      value: search.value,
      page,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleSortChange = useCallback((value: string) => {
    setSort(value);

    searchQuery.set({
      value: search.value,
      page: 1,
    });
  }, []);

  const content = useMemo(() => {
    if (isLoading) return null;

    if (themes.length) {
      return themes.map((theme) => (
        <ThemeCard key={theme.name} theme={theme} />
      ));
    }

    return (
      <div className="col-span-4 mt-32 flex flex-col items-center justify-center gap-6 text-center">
        <Frown className="size-10 text-muted-foreground" />
        <p className="font-medium text-muted-foreground">
          No themes found... <br /> consider contributing with what you think is
          missing!
        </p>
        <Button
          variant="secondary"
          size="sm"
          className="w-fit"
          onClick={() => {
            window.open(
              "https://github.com/hydralauncher/hydra-themes/pulls",
              "_blank",
            );
          }}
        >
          Submit a theme
        </Button>
      </div>
    );
  }, [isLoading, themes]);

  return (
    <div className="mt-20 flex flex-col gap-4">
      <div className="flex flex-row justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold">Community Themes</h2>
          <h4 className="text-sm text-muted-foreground">
            {isLoading ? "Loading..." : `${compactNumber(themeCount)} themes`}
          </h4>
        </div>

        <ThemeSorting
          options={[
            { label: "Newest", icon: <CalendarArrowUp />, value: "newest" },
            {
              label: "Oldest",
              icon: <CalendarArrowDown />,
              value: "oldest",
            },
            { label: "Downloads", icon: <Flame />, value: "downloads" },
            {
              label: "Favorites",
              icon: <Heart />,
              value: "favorites",
            },
          ]}
          selectedValue={sort}
          onSelect={handleSortChange}
        />
      </div>

      <div className="relative mt-1 grid h-full grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {content}
      </div>

      <div className="my-16 flex w-full justify-center">
        <ThemePagination
          pagination={{
            page: search.page,
            perPage: 12,
            total: themeCount,
          }}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
