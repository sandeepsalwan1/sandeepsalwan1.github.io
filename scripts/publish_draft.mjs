import fs from "node:fs/promises";
import path from "node:path";
import { loadAutomationConfig, loadSiteConfig } from "./lib/config.mjs";
import { stripDraftWorkpad } from "./lib/drafts.mjs";
import { parseFrontmatter, serializeFrontmatter } from "./lib/frontmatter.mjs";
import {
  getLocalDateStamp,
  getPostsDir,
  listDraftFiles,
  normalizePostData,
  slugify,
} from "./lib/posts.mjs";

function requestedDraft() {
  const args = process.argv.slice(2);
  const slugIndex = args.indexOf("--slug");
  if (slugIndex !== -1) {
    return args[slugIndex + 1]?.trim() ?? "";
  }

  return args.find((argument) => !argument.startsWith("-"))?.trim() ?? "";
}

function validateDraft(data, content, relativePath) {
  const problems = [];

  if (!String(data.title ?? "").trim()) {
    problems.push("missing title");
  }
  if (!String(data.description ?? "").trim()) {
    problems.push("missing description");
  }
  if (!content || content.includes("Write here.")) {
    problems.push("missing article body");
  }
  if (/\bTODO\b|\[INSERT\b|\[ADD\b/i.test(content)) {
    problems.push("unresolved draft placeholder");
  }

  if (problems.length > 0) {
    throw new Error(`${relativePath} is not ready: ${problems.join(", ")}`);
  }
}

const query = requestedDraft();
const drafts = await listDraftFiles();

if (drafts.length === 0) {
  console.error("No drafts found. Create one with npm run draft:new.");
  process.exit(1);
}

let draftPath;
if (!query && drafts.length === 1) {
  [draftPath] = drafts;
} else if (query) {
  const requestedSlug = slugify(path.basename(query, path.extname(query)));
  const matches = drafts.filter(
    (filePath) => slugify(path.basename(filePath, path.extname(filePath))) === requestedSlug,
  );

  if (matches.length === 1) {
    [draftPath] = matches;
  } else if (matches.length > 1) {
    console.error(`More than one draft matched "${query}".`);
    process.exit(1);
  }
}

if (!draftPath) {
  console.error("Choose a draft:");
  for (const filePath of drafts) {
    console.error(`- ${path.basename(filePath, path.extname(filePath))}`);
  }
  console.error("Run: npm run draft:publish -- <draft-name>");
  process.exit(1);
}

const raw = await fs.readFile(draftPath, "utf8");
const { data, content } = parseFrontmatter(raw);
const publicContent = stripDraftWorkpad(content);
const relativePath = path.relative(process.cwd(), draftPath);
validateDraft(data, publicContent, relativePath);
const requestedSlug = String(data.slug ?? "").trim();
const slug = slugify(requestedSlug || data.title);
if (!slug) {
  throw new Error(`${relativePath} is not ready: invalid slug`);
}

const [automationConfig, siteConfig, postsDir] = await Promise.all([
  loadAutomationConfig(),
  loadSiteConfig(),
  getPostsDir(),
]);
const canonicalBase = automationConfig.site.canonical_base || siteConfig.url;
const normalized = normalizePostData({ ...data, slug, canonical_url: "" }, canonicalBase);
const destinationPath = path.join(postsDir, `${getLocalDateStamp()}-${slug}.md`);

try {
  await fs.access(destinationPath);
  console.error(`A published post already exists: ${path.relative(process.cwd(), destinationPath)}`);
  process.exit(1);
} catch (error) {
  if (error.code !== "ENOENT") {
    throw error;
  }
}

if (process.argv.includes("--check")) {
  console.log(`${relativePath} is ready to publish as ${path.relative(process.cwd(), destinationPath)}`);
  process.exit(0);
}

await fs.mkdir(postsDir, { recursive: true });
await fs.writeFile(destinationPath, serializeFrontmatter(normalized, publicContent));
await fs.unlink(draftPath);

console.log(path.relative(process.cwd(), destinationPath));
console.log("Commit and push this promotion to publish the canonical page and configured cross-posts.");
