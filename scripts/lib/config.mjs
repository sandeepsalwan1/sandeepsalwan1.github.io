import fs from "node:fs/promises";
import path from "node:path";
import { parse } from "yaml";

const DEFAULT_CONFIG = {
  site: {
    canonical_base: "https://sandeeps.tech",
  },
  paths: {
    posts_dir: "_posts",
  },
  platforms: {
    devto: {
      enabled: true,
      api_token_secret: "DEVTO_TOKEN",
    },
    medium: {
      enabled: false,
      api_token_secret: "MEDIUM_TOKEN",
    },
    hashnode: {
      enabled: true,
      api_token_secret: "HASHNODE_TOKEN",
      default_publication_id_secret: "HASHNODE_PUBLICATION_ID",
    },
    social: {
      enabled: true,
      state_file: ".automation/social-post-state.json",
    },
  },
};

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function mergeDeep(base, override) {
  if (!isPlainObject(base) || !isPlainObject(override)) {
    return override ?? base;
  }

  const result = { ...base };
  for (const [key, value] of Object.entries(override)) {
    if (isPlainObject(value) && isPlainObject(base[key])) {
      result[key] = mergeDeep(base[key], value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

async function loadYamlIfPresent(filePath) {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return parse(raw) ?? {};
  } catch (error) {
    if (error.code === "ENOENT") {
      return {};
    }
    throw error;
  }
}

export async function loadAutomationConfig(cwd = process.cwd()) {
  const configPath = path.join(cwd, "config.yml");
  const examplePath = path.join(cwd, "config.example.yml");
  const loaded =
    Object.keys(await loadYamlIfPresent(configPath)).length > 0
      ? await loadYamlIfPresent(configPath)
      : await loadYamlIfPresent(examplePath);

  return mergeDeep(DEFAULT_CONFIG, loaded);
}

export async function loadSiteConfig(cwd = process.cwd()) {
  return loadYamlIfPresent(path.join(cwd, "_config.yml"));
}
