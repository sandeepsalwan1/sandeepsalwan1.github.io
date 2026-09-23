import fs from "node:fs/promises";
import path from "node:path";
import { getDraftsDir, normalizeTags, slugify } from "./lib/posts.mjs";
import { loadAutomationConfig, loadSiteConfig } from "./lib/config.mjs";
import { parseFrontmatter, serializeFrontmatter } from "./lib/frontmatter.mjs";

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
  console.error('Usage: npm run draft:import -- --source "/path/to/draft.txt" [--title "My Title"] [--description "Short summary"] [--tags "ai,llm"]');
  process.exit(1);
}

const raw = await fs.readFile(sourcePath, "utf8");
const { data: sourceData, content: sourceContent } = parseFrontmatter(raw);
const title = getArg("--title").trim() || String(sourceData.title ?? "").trim() || deriveTitle(sourcePath, sourceContent);
const description =
  getArg("--description").trim() ||
  String(sourceData.description ?? "").trim() ||
  deriveDescription(sourceContent);
const requestedTags = getArg("--tags");
const tags = requestedTags
  ? requestedTags.split(",").map((tag) => tag.trim()).filter(Boolean)
  : normalizeTags(sourceData.tags);

const slug = slugify(title);
const draftsDir = await getDraftsDir();
const filePath = path.join(draftsDir, `${slug}.md`);

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
    ...sourceData,
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
  sourceContent,
);

await fs.mkdir(draftsDir, { recursive: true });
await fs.writeFile(filePath, content);
console.log(path.relative(process.cwd(), filePath));
console.log(`Publish when ready: npm run draft:publish -- ${slug}`);
