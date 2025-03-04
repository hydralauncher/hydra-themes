export function Note() {
  return (
    <div className="fixed bottom-4 right-4 z-[999] flex items-center gap-2 rounded-md border border-border/65 bg-muted/70 p-4 shadow-lg backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <img
          src="/golden-badge-animated.webp"
          alt="golden badge"
          loading="lazy"
          width={40}
          height={40}
        />
      </div>
      <div>
        <div className="text-base font-medium">
          Get the theme editor golden badge
        </div>
        <div className="text-sm text-muted-foreground max-w-[600px]">
          The users with the top 3 most voted themes by the end of February will
          receive a golden badge in their profile.
        </div>
      </div>
    </div>
  );
}
