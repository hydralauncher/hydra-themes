import { useStore } from "@nanostores/react";
import { searchQuery } from "@/stores/search";
import { ThemeCard } from "./theme-card";
import { Frown } from "lucide-react";
import { Button } from "./button";
import { ThemeSorting } from "./sorting";
import { sortThemes } from "@/stores/sort";
import { ThemePagination } from "./theme-pagination";
import type { Theme } from "@/lib/schemas/theme";

interface ThemeListProps {
  themes: Theme[];
}

export function ThemeList({ themes }: Readonly<ThemeListProps>) {
  const query = useStore(searchQuery);
  const sort = useStore(sortThemes);

  console.log(sort)

  const filteredThemes = themes.filter((theme) => {
    if (!query.length) return true;

    if (query.length < 3) {
      return theme.name.toLowerCase().startsWith(query.toLowerCase());
    }

    return theme.name.toLowerCase().includes(query.toLowerCase());
  });

  return (
    <div className="flex flex-col gap-4 mt-20">
      <div className="flex flex-row justify-between">
        <h2 className="text-2xl font-bold">Community Themes</h2>
        
        <ThemeSorting />
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
              No themes found... <br /> consider contributing with what you think
              is missing!
            </p>
            <Button variant="secondary" size="sm" className="w-fit">
              Submit a theme
            </Button>
          </div>
        )}
      </div>
      <div className="flex justify-center w-full my-16">
        <ThemePagination pagination={{ page: 1, perPage: 16, total: themes.length }} />
    </div>

    </div>
  );
}
