import "dotenv/config";

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { api } from "./api";
import postcss from "postcss";
import selectorParser from "postcss-selector-parser";
import { Theme } from "./schemas/theme";

const themesPath = path.join(import.meta.dirname, "..", "..", "themes");

const folders = fs.readdirSync(themesPath);

const getThemeFeatures = async (
  publicThemePath: string,
): Promise<Theme["features"]> => {
  const features: Theme["features"] = [];

  try {
    const result = postcss().process(
      fs.readFileSync(path.join(publicThemePath, "theme.css"), "utf8"),
    );

    const classNames = new Set<string>();

    const extractClasses = selectorParser((selectors) => {
      selectors.walkClasses((classNode) => {
        classNames.add(classNode.value);
      });
    });

    result.root.walkRules((rule) => {
      extractClasses.processSync(rule.selector);
    });

    for (const className of classNames) {
      if (className.startsWith("achievement-notification")) {
        features.push("achievement-notification");
      }
    }

    return features;
  } catch (err) {
    console.error(`Failed to get theme features for ${publicThemePath}`, err);
    return [];
  }
};

const hydraHeaderSecret = process.env.HYDRA_HEADER_SECRET;

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

    if (hydraHeaderSecret) {
      await api
        .post(`badges/${authorCode}/theme`, {
          headers: {
            "hydra-token": hydraHeaderSecret,
          },
        })
        .catch((err) => {
          console.error(
            `could not update user (${authorCode}) badge`,
            err.message,
            err.response?.data,
          );
        });
    }

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

      fs.renameSync(
        path.join(publicThemePath, cssFile),
        path.join(publicThemePath, "theme.css"),
      );

      await sharp(path.join(folderPath, screenshotFile))
        .resize(340, null, { fit: "inside" })
        .toFormat("webp")
        .toFile(path.join(publicThemePath, "screenshot.webp"));

      if (screenshotFile !== "screenshot.webp") {
        fs.unlinkSync(path.join(publicThemePath, screenshotFile));
      }
    }

    const features = await getThemeFeatures(publicThemePath);
    console.log(features);

    return {
      name: themeName,
      authorId: authorCode,
      features,
    };
  }),
)
  .then((themes) => themes.filter((theme) => theme))
  .then(async (themes) => {
    console.log(`Generated ${themes.length} themes`);

    if (hydraHeaderSecret) {
      await api.post("themes", {
        json: themes,
        headers: {
          "hydra-token": hydraHeaderSecret,
        },
      });
    } else {
      console.log("HYDRA_HEADER_SECRET is not set, skipping theme upload");
    }
  });
