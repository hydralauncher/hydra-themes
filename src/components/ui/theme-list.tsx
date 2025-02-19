import { ThemeCard } from "./theme-card";
import { Frown } from "lucide-react";
import { Button } from "./button";
import { ThemeSorting } from "./sorting";
import { ThemePagination } from "./theme-pagination";
import type { Theme } from "@/lib/schemas/theme";
import { useEffect, useState } from "react";

interface ThemeListProps {
  themes: Theme[];
  themeCount: number;
}

export function ThemeList(props: Readonly<ThemeListProps>) {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("downloads");
  const [themes, setThemes] = useState<Theme[]>([]);

  useEffect(() => {
    setThemes(props.themes);
  }, [props.themes]);

  useEffect(() => {
    setPage(1);
  }, [query]);

  useEffect(() => {
    fetch(`/api/themes?page=${page}&sort=${sort}`).then((res) => {
      res.json().then((data) => {
        setThemes(data.edges);
      });
    });
  }, [page, sort]);

  const filteredThemes = themes.filter((theme) => {
    if (!query.length) return true;

    if (query.length < 3) {
      return theme.name.toLowerCase().startsWith(query.toLowerCase());
    }

    return theme.name.toLowerCase().includes(query.toLowerCase());
  });

  return (
    <div className="flex flex-col gap-4 mt-20">
      <div className="flex flex-row items-end justify-between">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold">Community Themes</h2>
          <p className="text-sm text-muted-foreground">
            {filteredThemes.length} themes
          </p>
        </div>

        {/* <ThemeSorting /> */}
      </div>

      <div className="relative grid h-full mt-1 grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filteredThemes.length ? (
          filteredThemes.map((theme) => (
            <ThemeCard key={theme.name} theme={theme} />
          ))
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
      <div className="flex justify-center w-full my-16">
        <ThemePagination
          pagination={{ page, perPage: 12, total: props.themeCount }}
          onPageChange={(page) => setPage(page)}
        />
      </div>
    </div>
  );
}
