import { atom, type PreinitializedWritableAtom } from "nanostores";

export const searchQuery: PreinitializedWritableAtom<{
  value: string;
  page: number;
}> = atom({
  value: "",
  page: 1,
});
