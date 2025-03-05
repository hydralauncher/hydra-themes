import "dotenv/config";

import fs from "node:fs";
import path from "node:path";
import type { Theme } from "./schemas/theme";
import sharp from "sharp";
import { redis } from "./redis";
import { api } from "./api";

const themesPath = path.join(import.meta.dirname, "..", "..", "themes");

const folders = fs.readdirSync(themesPath);

const hydraHeaderSecret = process.env.HYDRA_HEADER_SECRET;

if (!hydraHeaderSecret) {
  throw new Error("HYDRA_HEADER_SECRET is not set");
}

Promise.all(
  folders.map(async (folder) => {
    const folderPath = path.join(themesPath, folder);
    const files = fs.readdirSync(folderPath);

    const cssFile = files.find((file) => file.endsWith(".css"));
    const screenshotFile = files.find((file) =>
      file.toLowerCase().startsWith("screenshot"),
    );

    if (!cssFile) {
      console.error(`No css file found for theme ${folder}`);
      return;
    }

    if (!screenshotFile) {
      console.error(`No screenshot file found for theme ${folder}`);
      return;
    }

    const parts = folder.split("-");
    const authorCode = parts.pop()?.trim();
    const themeName = parts.join("-").trim();

    const response = await api.get(`/users/${authorCode}`);

    await api
      .post(
        `/badges/${authorCode}/theme`,
        {},
        {
          headers: {
            "hydra-token": hydraHeaderSecret,
          },
        },
      )
      .catch((err) => {
        console.error(
          `could not update user (${authorCode}) badge`,
          err.message,
          err.response?.data,
        );
      })
      .catch((err) => {
        console.error(
          `could not update user (${authorCode}) badge`,
          err.message,
          err.response?.data,
        );
      });

    const data = response.data as Theme["author"];

    const publicThemePath = path.join(
      import.meta.dirname,
      "..",
      "..",
      "public",
      "themes",
      themeName.toLowerCase(),
    );

    if (!fs.existsSync(publicThemePath)) {
      fs.cpSync(path.join(folderPath), publicThemePath, { recursive: true });

      await sharp(path.join(folderPath, screenshotFile))
        .resize(340, null, { fit: "inside" })
        .toFormat("webp")
        .toFile(path.join(publicThemePath, "screenshot.webp"));
    }

    const redisKey = `theme:${authorCode}:${themeName}`;

    const themeData = await redis.get(redisKey);

    if (!themeData) {
      await redis.set(
        redisKey,
        JSON.stringify({
          downloads: 0,
          favorites: 0,
          createdAt: new Date(),
        }),
      );
    }

    return {
      id: `${authorCode}:${themeName}`,
      name: themeName,
      author: data,
      screenshotFile: screenshotFile,
      cssFile: cssFile,
      downloads: 0,
      favorites: 0,
    } as Theme;
  }),
)
  .then((themes) => themes.filter((theme) => theme))
  .then((themes) => {
    console.log(`Generated ${themes.length} themes`);

    fs.writeFileSync(
      path.join(import.meta.dirname, "themes.json"),
      // Fix themes returning null
      JSON.stringify(themes.filter((theme) => theme)),
    );

    redis.disconnect();
  });
