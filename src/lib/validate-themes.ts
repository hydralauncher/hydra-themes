import fs from "node:fs";
import path from "node:path";
import { ALLOWED_SCREENSHOT_FORMATS } from "./constants";
import { api } from "./api";

const themesPath = path.join(import.meta.dirname, "..", "..", "themes");

const folders = fs.readdirSync(themesPath);

folders.forEach(async (folder) => {
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
    throw new Error(`❌ No screenshot file found for theme ${folder}`);
  }

  const parts = folder.split("-");
  const authorCode = parts.pop()?.trim();

  await api.get(`/users/${authorCode}`).catch(() => {
    throw new Error(`❌ Failed to fetch author ${authorCode}`);
  });
});
