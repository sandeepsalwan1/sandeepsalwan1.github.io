import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { execFile } from "node:child_process";
import { loadAutomationConfig, loadSiteConfig } from "./config.mjs";
import { parseFrontmatter, serializeFrontmatter } from "./frontmatter.mjs";

const execFileAsync = promisify(execFile);

function stripMarkdown(markdown) {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^#+\s+/gm, "")
    .replace(/[*_>~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function slugify(input) {
  return String(input ?? "")
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildCanonicalUrl(base, slug) {
  const canonicalBase = String(base ?? "").replace(/\/+$/, "");
  return `${canonicalBase}/blog/${slug}/`;
}

export function deriveSlugFromFilename(filePath) {
  const baseName = path.basename(filePath, path.extname(filePath));
  return baseName.replace(/^\d{4}-\d{2}-\d{2}-/, "");
}

export function normalizeTags(tags) {
  if (!Array.isArray(tags)) {
    return [];
  }

  return tags
    .map((tag) => String(tag).trim())
    .filter(Boolean);
}

export function normalizePostData(data, canonicalBase) {
  const normalized = { ...data };
  const slug = normalized.slug ? slugify(normalized.slug) : slugify(normalized.title);

  normalized.slug = slug;
  normalized.description = String(normalized.description ?? "").trim();
  normalized.canonical_url =
    String(normalized.canonical_url ?? "").trim() || buildCanonicalUrl(canonicalBase, slug);
  normalized.tags = normalizeTags(normalized.tags);

  if (normalized.cover_url === undefined) {
    normalized.cover_url = "";
  }

  if (normalized.publish_devto === undefined) {
    normalized.publish_devto = true;
  }

  if (normalized.publish_medium === undefined) {
    normalized.publish_medium = false;
  }

  if (normalized.publish_hashnode === undefined) {
    normalized.publish_hashnode = true;
  }

  if (!normalized.hashnode_publication_id) {
    normalized.hashnode_publication_id = "USE_DEFAULT";
  }

  return normalized;
}

async function listMarkdownFiles(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listMarkdownFiles(entryPath)));
      continue;
    }

    if (entry.isFile() && /\.(md|markdown)$/i.test(entry.name)) {
      files.push(entryPath);
    }
  }

  return files.sort();
}

export async function getPostsDir(cwd = process.cwd()) {
  const config = await loadAutomationConfig(cwd);
  return path.join(cwd, config.paths.posts_dir ?? "_posts");
}

export async function listPostFiles(cwd = process.cwd()) {
  const postsDir = await getPostsDir(cwd);
  return listMarkdownFiles(postsDir);
}

export async function readPostFile(filePath, cwd = process.cwd()) {
  const [automationConfig, siteConfig] = await Promise.all([
    loadAutomationConfig(cwd),
    loadSiteConfig(cwd),
  ]);
  const raw = await fs.readFile(filePath, "utf8");
  const { data, content } = parseFrontmatter(raw);
  const title = String(data.title ?? "").trim();
  const slug = slugify(data.slug || deriveSlugFromFilename(filePath) || title);
  const canonicalBase = automationConfig.site.canonical_base || siteConfig.url;
  const normalizedData = normalizePostData(
    {
      ...data,
      slug,
    },
    canonicalBase,
  );

  return {
    filePath,
    relativePath: path.relative(cwd, filePath),
    data: normalizedData,
    content: content.trim(),
    title,
    description:
      normalizedData.description ||
      stripMarkdown(content).slice(0, 180),
    slug,
    canonicalUrl: normalizedData.canonical_url,
    tags: normalizedData.tags,
    coverUrl: normalizedData.cover_url,
    publishedAt:
      normalizedData.date ||
      `${path.basename(filePath).slice(0, 10)}T09:00:00.000Z`,
  };
}

export async function normalizePostFile(filePath, { checkOnly = false, cwd = process.cwd() } = {}) {
  const [automationConfig, siteConfig] = await Promise.all([
    loadAutomationConfig(cwd),
    loadSiteConfig(cwd),
  ]);
  const raw = await fs.readFile(filePath, "utf8");
  const { data, content } = parseFrontmatter(raw);
  const slug = slugify(data.slug || deriveSlugFromFilename(filePath) || data.title);
  const canonicalBase = automationConfig.site.canonical_base || siteConfig.url;
  const normalized = normalizePostData(
    {
      ...data,
      slug,
    },
    canonicalBase,
  );
  const nextSource = serializeFrontmatter(normalized, content);
  const changed = nextSource !== raw;

  if (changed && !checkOnly) {
    await fs.writeFile(filePath, nextSource);
  }

  return {
    changed,
    relativePath: path.relative(cwd, filePath),
  };
}

function unique(items) {
  return [...new Set(items)];
}

function filterPostPaths(files, postsDir) {
  const normalizedPostsDir = `${postsDir}${path.sep}`;
  return unique(
    files
      .filter(Boolean)
      .map((file) => file.replace(/^\.\/+/, ""))
      .filter((file) => file === postsDir || file.startsWith(normalizedPostsDir))
      .filter((file) => /\.(md|markdown)$/i.test(file)),
  );
}

async function filesFromGitEvent(postsDir, { addedOnly }) {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) {
    return [];
  }

  const raw = await fs.readFile(eventPath, "utf8");
  const payload = JSON.parse(raw);
  const commits = Array.isArray(payload.commits) ? payload.commits : [];
  const files = [];

  for (const commit of commits) {
    if (Array.isArray(commit.added)) {
      files.push(...commit.added);
    }

    if (!addedOnly && Array.isArray(commit.modified)) {
      files.push(...commit.modified);
    }
  }

  return filterPostPaths(files, postsDir);
}

async function filesFromGitDiff(postsDir, { addedOnly, cwd }) {
  try {
    const diffFilter = addedOnly ? "A" : "AM";
    const { stdout } = await execFileAsync(
      "git",
      ["diff", "--name-only", `--diff-filter=${diffFilter}`, "HEAD~1", "HEAD", "--", postsDir],
      { cwd },
    );
    return filterPostPaths(stdout.split("\n"), postsDir);
  } catch {
    return [];
  }
}

export async function getCandidatePostFiles({
  cwd = process.cwd(),
  addedOnly = false,
  fallbackToLatest = false,
} = {}) {
  const config = await loadAutomationConfig(cwd);
  const postsDir = config.paths.posts_dir ?? "_posts";

  if (process.env.POST_PATH) {
    return [path.join(cwd, process.env.POST_PATH)];
  }

  const fromEvent = await filesFromGitEvent(postsDir, { addedOnly });
  if (fromEvent.length > 0) {
    return fromEvent.map((file) => path.join(cwd, file));
  }

  const fromDiff = await filesFromGitDiff(postsDir, { addedOnly, cwd });
  if (fromDiff.length > 0) {
    return fromDiff.map((file) => path.join(cwd, file));
  }

  if (fallbackToLatest) {
    const allFiles = await listPostFiles(cwd);
    return allFiles.length > 0 ? [allFiles[allFiles.length - 1]] : [];
  }

  return [];
}

export async function appendStepSummary(markdown) {
  if (!process.env.GITHUB_STEP_SUMMARY) {
    return;
  }

  await fs.appendFile(process.env.GITHUB_STEP_SUMMARY, `${markdown}\n`);
}

export async function ensureDirectory(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

export async function readJsonIfPresent(filePath, fallbackValue) {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === "ENOENT") {
      return fallbackValue;
    }
    throw error;
  }
}

export async function writeJson(filePath, value) {
  await ensureDirectory(filePath);
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}
