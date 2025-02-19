import { ThemeCard } from "./theme-card";
import { Frown } from "lucide-react";
import { Button } from "./button";
import { ThemeSorting } from "./sorting";
import { ThemePagination } from "./theme-pagination";
import type { Theme } from "@/lib/schemas/theme";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Heart, Flame } from "lucide-react";
import { searchQuery } from "@/stores/search";
import { useStore } from "@nanostores/react";

interface ThemeListProps {
  themes: Theme[];
  themeCount: number;
  sort: string;
}

export function ThemeList(props: Readonly<ThemeListProps>) {
  const [sort, setSort] = useState(props.sort);
  const search = useStore(searchQuery);

  const [themes, setThemes] = useState<Theme[]>(props.themes);
  const [themeCount, setThemeCount] = useState(props.themeCount);

  useEffect(() => {
    if (search.page > 1 || sort !== props.sort || search.value) {
      axios
        .get(
          `/api/themes?page=${search.page}&sort=${sort}&query=${search.value}`,
        )
        .then((res) => {
          setThemes(res.data.edges);
          setThemeCount(res.data.count);
        });
    } else {
      setThemes(props.themes);
      setThemeCount(props.themeCount);
    }
  }, [search.page, sort, search]);

  const handlePageChange = useCallback((page: number) => {
    searchQuery.set({
      value: search.value,
      page,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="mt-20 flex flex-col gap-4">
      <div className="flex flex-row justify-between">
        <h2 className="text-2xl font-bold">Community Themes</h2>

        <ThemeSorting
          options={[
            // { label: "Newest", icon: <CalendarArrowUp />, value: "newest" },
            // { label: "Oldest", icon: <CalendarArrowDown />, value: "oldest" },
            { label: "Most Popular", icon: <Flame />, value: "downloads" },
            {
              label: "Most Favorited",
              icon: <Heart />,
              value: "favorites",
            },
          ]}
          selectedValue={sort}
          onSelect={setSort}
        />
      </div>

      <div className="relative mt-1 grid h-full grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {themes.length ? (
          themes.map((theme) => <ThemeCard key={theme.name} theme={theme} />)
        ) : (
          <div className="col-span-4 mt-32 flex flex-col items-center justify-center gap-6 text-center">
            <Frown className="size-10 text-muted-foreground" />
            <p className="font-medium text-muted-foreground">
              No themes found... <br /> consider contributing with what you
              think is missing!
            </p>
            <Button variant="secondary" size="sm" className="w-fit">
              Submit a theme
            </Button>
          </div>
        )}
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
