import { ClassicLevel } from "classic-level";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";

const THEME_NAME = "Neon Cyber Pulse";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const themeCssPath = path.join(
  projectRoot,
  "themes",
  "Neon-Cyber-Pulse-x5kbPVeQ",
  "theme.css",
);

const hydraUserData = path.join(
  process.env.APPDATA ?? "",
  "hydralauncher",
);
const dbPath = path.join(hydraUserData, "hydra-db");
const themesAssetsPath = path.join(hydraUserData, "themes");

function sanitizeFolderName(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function findHydraProcesses() {
  try {
    const out = execSync(
      'tasklist /FI "IMAGENAME eq Hydra.exe" /FO CSV /NH',
      { encoding: "utf8" },
    );
    return out.includes("Hydra.exe");
  } catch {
    return false;
  }
}

async function main() {
  if (!fs.existsSync(themeCssPath)) {
    console.error(`❌ CSS não encontrado: ${themeCssPath}`);
    process.exit(1);
  }

  if (!fs.existsSync(dbPath)) {
    console.error(`❌ Hydra não encontrado em: ${hydraUserData}`);
    console.error("   Instale e abra o Hydra Launcher pelo menos uma vez.");
    process.exit(1);
  }

  if (findHydraProcesses()) {
    console.error("❌ O Hydra está aberto. Feche o launcher e rode o script novamente.");
    process.exit(1);
  }

  const css = fs.readFileSync(themeCssPath, "utf8");
  const now = new Date().toISOString();
  const db = new ClassicLevel(dbPath, { valueEncoding: "json" });
  const themes = db.sublevel("themes", { valueEncoding: "json" });

  let existingId = null;
  let existingCreatedAt = now;

  for await (const [key, value] of themes.iterator()) {
    if (value?.name === THEME_NAME) {
      existingId = key;
      existingCreatedAt = value.createdAt ?? now;
      break;
    }
  }

  const themeId = existingId ?? randomUUID();

  for await (const [key, value] of themes.iterator()) {
    if (value?.isActive) {
      await themes.put(key, {
        ...value,
        isActive: false,
        updatedAt: now,
      });
    }
  }

  await themes.put(themeId, {
    id: themeId,
    name: THEME_NAME,
    isActive: true,
    code: css,
    createdAt: existingCreatedAt,
    updatedAt: now,
  });

  await db.close();

  const themeFolder = path.join(themesAssetsPath, sanitizeFolderName(THEME_NAME));
  fs.mkdirSync(themeFolder, { recursive: true });

  const screenshotSrc = path.join(
    projectRoot,
    "themes",
    "Neon-Cyber-Pulse-x5kbPVeQ",
    "screenshot.png",
  );
  if (fs.existsSync(screenshotSrc)) {
    fs.copyFileSync(screenshotSrc, path.join(themeFolder, "screenshot.png"));
  }

  console.log(`✅ Tema "${THEME_NAME}" instalado e ativado!`);
  console.log(`   ID: ${themeId}`);
  console.log(`   Pasta de assets: ${themeFolder}`);
  console.log("");
  console.log("Abra o Hydra Launcher para ver o tema.");
}

main().catch((err) => {
  if (err.code === "LEVEL_LOCKED") {
    console.error("❌ Banco de dados bloqueado. Feche o Hydra completamente.");
  } else {
    console.error("❌ Erro:", err.message ?? err);
  }
  process.exit(1);
});
