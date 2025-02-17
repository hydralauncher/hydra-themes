import "dotenv/config";

import fs from "node:fs";
import path from "node:path";
import type { Theme } from "./schemas/theme";

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
    const screenshotFile = files.find((file) => file.startsWith("screenshot"));

    if (!cssFile) {
      console.error(`No css file found for theme ${folder}`);
      return;
    }

    if (!screenshotFile) {
      console.error(`No screenshot file found for theme ${folder}`);
      return;
    }

    const [themeName, authorCode] = folder.split("-");

    const response = await fetch(
      `https://hydra-api-us-east-1.losbroxas.org/themes/users/${authorCode}`,
      {
        headers: {
          "Content-Type": "application/json",
          "hydra-token": hydraHeaderSecret,
        },
      },
    );

    if (!response.ok) {
      console.error(`Failed to fetch author ${authorCode}`);
      return;
    }

    const data = (await response.json()) as Theme["author"];

    fs.cpSync(
      path.join(folderPath),
      path.join(
        import.meta.dirname,
        "..",
        "..",
        "public",
        "themes",
        themeName.toLowerCase(),
      ),
      { recursive: true },
    );

    const url = new URL(data.profileImageUrl);
    url.search = "";

    data.profileImageUrl = url.toString();

    const fileExt = path.extname(data.profileImageUrl);
    const authorResponse = await fetch(data.profileImageUrl).then((res) =>
      res.arrayBuffer(),
    );

    fs.writeFileSync(
      path.join(
        import.meta.dirname,
        "..",
        "..",
        "public",
        "themes",
        themeName.toLowerCase(),
        `author${fileExt}`,
      ),
      Buffer.from(authorResponse),
    );

    return {
      name: themeName,
      author: data,
      screenshotFile: screenshotFile,
      cssFile: cssFile,
      authorImage: `author${fileExt}`,
    };
  }),
).then((themes) => {
  console.log(`Generated ${themes.length} themes`);

  fs.writeFileSync(
    path.join(import.meta.dirname, "themes.json"),
    JSON.stringify(themes),
  );
});
