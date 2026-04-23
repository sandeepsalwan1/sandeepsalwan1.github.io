import fs from "node:fs/promises";
import path from "node:path";
import { getLocalDateStamp, getPostsDir, slugify } from "./lib/posts.mjs";
import { loadAutomationConfig, loadSiteConfig } from "./lib/config.mjs";
import { serializeFrontmatter } from "./lib/frontmatter.mjs";

function getArg(flag) {
  const index = process.argv.indexOf(flag);
  if (index === -1) {
    return "";
  }

  return process.argv[index + 1] ?? "";
}

function deriveTitle(sourcePath, content) {
  const heading = content.match(/^#\s+(.+)$/m)?.[1]?.trim();
  if (heading) {
    return heading;
  }

  const firstLine = content
    .split("\n")
    .map((line) => line.trim())
    .find(Boolean);
  if (firstLine) {
    return firstLine.slice(0, 90);
  }

  return path.basename(sourcePath, path.extname(sourcePath));
}

function deriveDescription(content) {
  return content
    .replace(/^#\s+.+$/m, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
}

const sourcePath = getArg("--source").trim();
if (!sourcePath) {
  console.error('Usage: npm run post:import -- --source "/path/to/draft.txt" [--title "My Title"] [--description "Short summary"] [--tags "ai,llm"]');
  process.exit(1);
}

const raw = await fs.readFile(sourcePath, "utf8");
const title = getArg("--title").trim() || deriveTitle(sourcePath, raw);
const description = getArg("--description").trim() || deriveDescription(raw);
const tags = getArg("--tags")
  .split(",")
  .map((tag) => tag.trim())
  .filter(Boolean);

const slug = slugify(title);
const today = getLocalDateStamp();
const postsDir = await getPostsDir();
const filePath = path.join(postsDir, `${today}-${slug}.md`);

try {
  await fs.access(filePath);
  console.error(`Post already exists: ${filePath}`);
  process.exit(1);
} catch (error) {
  if (error.code !== "ENOENT") {
    throw error;
  }
}

const [automationConfig, siteConfig] = await Promise.all([
  loadAutomationConfig(),
  loadSiteConfig(),
]);

const canonicalBase = String(automationConfig.site.canonical_base || siteConfig.url).replace(/\/+$/, "");
const content = serializeFrontmatter(
  {
    title,
    description,
    slug,
    canonical_url: `${canonicalBase}/blog/${slug}/`,
    tags,
    cover_url: "",
    publish_devto: true,
    publish_medium: false,
    publish_hashnode: true,
    hashnode_publication_id: "USE_DEFAULT",
  },
  raw.trim(),
);

await fs.writeFile(filePath, content);
console.log(filePath);
