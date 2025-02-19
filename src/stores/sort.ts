import { atom, type PreinitializedWritableAtom } from "nanostores";

export const sortThemes: PreinitializedWritableAtom<string | undefined> = atom(undefined);
