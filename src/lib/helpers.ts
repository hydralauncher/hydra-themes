const formatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  compactDisplay: "short",
});

export const compactNumber = (number: number) => formatter.format(number);
