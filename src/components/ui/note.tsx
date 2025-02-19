export const Note = () => {
  return (
    <div className="fixed bottom-4 right-4 rounded-md p-3 flex items-center gap-2 z-[999] backdrop-blur-xl bg-muted/70 mb-2 shadow-lg border border-border/65">
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
        <div className="text-base font-medium">Lorem Ipsum</div>
        <div className="text-sm">lorem ipsum dolor sit amet</div>
      </div>
    </div>
  );
}