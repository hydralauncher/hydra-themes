import fs from "node:fs";
import path from "node:path";
import { ALLOWED_SCREENSHOT_FORMATS } from "./constants";
import { api } from "./api";

const themesPath = path.join(import.meta.dirname, "..", "..", "themes");

const folders = fs.readdirSync(themesPath);

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
      !ALLOWED_SCREENSHOT_FORMATS.includes(screenshotFile.split(".").pop()!)
    ) {
      throw new Error(
        `❌ No screenshot file found for theme ${folder}.\nScreenshot file must be named 'screenshot' and have one of the following extensions: ${ALLOWED_SCREENSHOT_FORMATS.join(", ")}`,
      );
    }

    const parts = folder.split("-");
    const authorCode = parts.pop()?.trim();

    await api.get(`/users/${authorCode}`).catch(() => {
      throw new Error(`❌ Failed to fetch author ${authorCode}`);
    });
  }),
)
  .then(() => console.log(`✅ Validated ${folders.length} themes`))
  .catch((err: Error) => {
    console.error(err.message);
    process.exit(1);
  });
