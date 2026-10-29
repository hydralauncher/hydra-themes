import fs from "node:fs";
import path from "node:path";
import { ALLOWED_SCREENSHOT_FORMATS } from "./constants";
import { api } from "./api";

// Author lookups hit the production API, so they are deduped, run with a
// small concurrency limit and, by default, only done for changed themes.
//
// CHANGED_THEMES: newline-separated theme folder names whose author should be
// looked up (CI passes the folders touched by the PR). Folders that no longer
// exist (deleted/renamed) are ignored.
// VALIDATE_ALL_AUTHORS=1: look up the author of every theme instead.
// With neither set, author lookups are skipped.
const AUTHOR_LOOKUP_CONCURRENCY = 4;

const themesPath = path.join(import.meta.dirname, "..", "..", "themes");

const folders = fs.readdirSync(themesPath);

const getAuthorCode = (folder: string) => folder.split("-").pop()?.trim();

const validateFolder = (folder: string) => {
  // CHANGED_THEMES is newline-separated, so such a folder could never be
  // matched for an author lookup.
  if (folder.includes("\n"))
    throw new Error(
      `❌ Invalid theme folder name ${JSON.stringify(folder)} - contains a line break`,
    );

  const folderPath = path.join(themesPath, folder);
  const files = fs.readdirSync(folderPath);

  const cssFile = files.find((file) => file.endsWith(".css"));

  if (!cssFile) {
    throw new Error(`❌ No css file found for theme ${folder}`);
  }

  const screenshotFile = files.find((file) =>
    file.toLowerCase().startsWith("screenshot"),
  );

  if (
    !screenshotFile ||
    !ALLOWED_SCREENSHOT_FORMATS.includes(
      screenshotFile.split(".").pop()!.toLowerCase(),
    )
  ) {
    throw new Error(
      `❌ No screenshot file found for theme ${folder}.\nScreenshot file must be named 'screenshot' and have one of the following extensions: ${ALLOWED_SCREENSHOT_FORMATS.join(", ")}`,
    );
  }

  if (!getAuthorCode(folder))
    throw new Error(
      `❌ Invalid theme folder name ${folder} - missing author code`,
    );

  return folder.split("-").slice(0, -1).join("-").trim();
};

const getFoldersToLookUp = () => {
  if (process.env.VALIDATE_ALL_AUTHORS === "1") return folders;

  if (process.env.CHANGED_THEMES === undefined) {
    console.warn(
      "⚠️ CHANGED_THEMES not set, skipping author lookups (set VALIDATE_ALL_AUTHORS=1 to check all authors)",
    );
    return [];
  }

  const changed = new Set(
    // no trimming: names must match the folders on disk exactly
    process.env.CHANGED_THEMES.split("\n").filter(Boolean),
  );

  return folders.filter((folder) => changed.has(folder));
};

const validateAuthors = async (authorCodes: string[]) => {
  const queue = [...authorCodes];

  const worker = async () => {
    while (queue.length > 0) {
      const authorCode = queue.shift()!;
      await api.get(`users/${encodeURIComponent(authorCode)}`).catch((err) => {
        console.error(err);
        // stop the other workers from sending more requests
        queue.length = 0;
        throw new Error(`❌ Failed to fetch author ${authorCode}`);
      });
    }
  };

  await Promise.all(
    Array.from({ length: AUTHOR_LOOKUP_CONCURRENCY }, () => worker()),
  );
};

const run = async () => {
  const themes = folders.map(validateFolder);

  // validate if theme name is unique
  const uniqueThemes = new Set(themes);
  if (uniqueThemes.size !== themes.length) {
    throw new Error(
      `❌ Found duplicate theme names: ${themes
        .filter((theme, index) => themes.indexOf(theme) !== index)
        .join(", ")}`,
    );
  }

  const authorCodes = [
    ...new Set(getFoldersToLookUp().map((folder) => getAuthorCode(folder)!)),
  ];

  await validateAuthors(authorCodes);

  console.log(
    `✅ Validated ${folders.length} themes (${authorCodes.length} author lookups)`,
  );
};

run().catch((err: Error) => {
  console.error(err.message);
  process.exit(1);
});
