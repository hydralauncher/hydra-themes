import { ThemeCard } from "./theme-card";
import { Frown } from "lucide-react";
import { Button } from "./button";
import { ThemeSorting } from "./sorting";
import { ThemePagination } from "./theme-pagination";
import type { Theme } from "@/lib/schemas/theme";
import { useCallback, useEffect, useState } from "react";

import { Heart, Flame } from "lucide-react";

interface ThemeListProps {
  themes: Theme[];
  themeCount: number;
  sort: string;
}

export function ThemeList(props: Readonly<ThemeListProps>) {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState(props.sort);

  const [themes, setThemes] = useState<Theme[]>(props.themes);

  useEffect(() => {
    if (page > 1 || sort !== props.sort) {
      fetch(`/api/themes?page=${page}&sort=${sort}`).then((res) => {
        res.json().then((data) => {
          setThemes(data.edges);
        });
      });
    } else {
      setThemes(props.themes);
    }
  }, [page, sort]);

  const handlePageChange = useCallback((page: number) => {
    setPage(page);

    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // const filteredThemes = themes.filter((theme) => {
  //   if (!query.length) return true;

  //   if (query.length < 3) {
  //     return theme.name.toLowerCase().startsWith(query.toLowerCase());
  //   }

  //   return theme.name.toLowerCase().includes(query.toLowerCase());
  // });

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
          pagination={{ page, perPage: 12, total: props.themeCount }}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
