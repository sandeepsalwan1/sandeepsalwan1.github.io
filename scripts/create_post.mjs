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

const title = getArg("--title").trim();
if (!title) {
  console.error('Usage: npm run post:new -- --title "My Post Title" [--description "Short summary"] [--tags "ai,llm"]');
  process.exit(1);
}

const description = getArg("--description").trim();
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
  "Write here.\n",
);

await fs.writeFile(filePath, content);
console.log(filePath);
