import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { ALLOWED_SCREENSHOT_FORMATS } from "./constants";
import { api } from "./api";

const themesPath = path.join(import.meta.dirname, "..", "..", "themes");

const folders = fs.readdirSync(themesPath);

const hydraHeaderSecret = process.env.HYDRA_HEADER_SECRET;
const baseRef = process.env.GITHUB_BASE_REF;

// On pull requests only the touched themes need an author lookup; the API rate-limits anonymous profile reads.
const changedFolders = baseRef
  ? new Set(
      execFileSync(
        "git",
        ["diff", "--name-only", `origin/${baseRef}...HEAD`, "--", "themes"],
        { encoding: "utf8" },
      )
        .split("\n")
        .map((file) => file.split("/")[1])
        .filter(Boolean),
    )
  : null;

const checkedAuthors = new Map<string, Promise<unknown>>();

const checkAuthor = (authorCode: string) => {
  const existing = checkedAuthors.get(authorCode);
  if (existing) return existing;

  const request = api
    .get(`users/${authorCode}`, {
      headers: hydraHeaderSecret ? { "hydra-token": hydraHeaderSecret } : {},
    })
    .catch((err) => {
      console.error(err);
      throw new Error(`❌ Failed to fetch author ${authorCode}`);
    });
  checkedAuthors.set(authorCode, request);
  return request;
};

Promise.all(
  folders.map(async (folder) => {
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

    const parts = folder.split("-");
    const authorCode = parts.pop()?.trim();
    if (!authorCode)
      throw new Error(
        `❌ Invalid theme folder name ${folder} - missing author code`,
      );
    const themeName = parts.join("-").trim();

    if (!changedFolders || changedFolders.has(folder))
      await checkAuthor(authorCode);

    return themeName;
  }),
)
  .then((themes) => {
    // validate if theme name is unique
    const uniqueThemes = new Set(themes);
    if (uniqueThemes.size !== themes.length) {
      throw new Error(
        `❌ Found duplicate theme names: ${themes
          .filter((theme, index) => themes.indexOf(theme) !== index)
          .join(", ")}`,
      );
    }
  })
  .then(() => console.log(`✅ Validated ${folders.length} themes`))
  .catch((err: Error) => {
    console.error(err.message);
    process.exit(1);
  });
