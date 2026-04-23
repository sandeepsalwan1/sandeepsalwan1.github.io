import { loadAutomationConfig } from "./lib/config.mjs";
import { appendStepSummary, getCandidatePostFiles, readPostFile, slugify } from "./lib/posts.mjs";

const DEVTO_API_BASE = "https://dev.to/api";
const dryRun = process.env.DRY_RUN === "1";

function normalizeDevtoTag(tag) {
  return slugify(tag).replace(/-/g, "").slice(0, 25) || "blog";
}

async function devtoRequest(pathname, { token, method = "GET", body } = {}) {
  const response = await fetch(`${DEVTO_API_BASE}${pathname}`, {
    method,
    headers: {
      "api-key": token,
      "content-type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`dev.to API ${method} ${pathname} failed: ${response.status} ${await response.text()}`);
  }

  return response.json();
}

async function listAllArticles(token) {
  const pages = [];
  for (let page = 1; page <= 10; page += 1) {
    const chunk = await devtoRequest(`/articles/me/all?page=${page}&per_page=100`, { token });
    pages.push(...chunk);
    if (chunk.length < 100) {
      break;
    }
  }
  return pages;
}

const config = await loadAutomationConfig();
const enabled = config.platforms.devto?.enabled !== false;
const token = process.env.DEVTO_TOKEN;

if (!enabled) {
  console.log("dev.to publishing disabled in config.yml.");
  process.exit(0);
}

if (!token) {
  console.log("DEVTO_TOKEN not set. Skipping dev.to publish.");
  process.exit(0);
}

const files = await getCandidatePostFiles({
  addedOnly: false,
  fallbackToLatest: process.env.POST_PATH ? false : dryRun,
});
const posts = [];

for (const file of files) {
  const post = await readPostFile(file);
  if (post.data.publish_devto !== false) {
    posts.push(post);
  }
}

if (posts.length === 0) {
  console.log("No posts eligible for dev.to publishing.");
  process.exit(0);
}

const existingArticles = await listAllArticles(token);
const summaryLines = [dryRun ? "### dev.to Dry Run" : "### dev.to Publish"];

for (const post of posts) {
  const articlePayload = {
    article: {
      title: post.title,
      body_markdown: post.content,
      description: post.description,
      canonical_url: post.canonicalUrl,
      tags: post.tags.slice(0, 4).map(normalizeDevtoTag),
      published: true,
    },
  };

  if (post.coverUrl) {
    articlePayload.article.main_image = post.coverUrl;
  }

  const existingArticle = existingArticles.find(
    (article) =>
      article.canonical_url === post.canonicalUrl ||
      article.slug === post.slug ||
      article.slug?.startsWith(`${post.slug}-`),
  );

  if (dryRun) {
    const action = existingArticle ? "update" : "create";
    console.log(`Would ${action} dev.to article for ${post.relativePath}`);
    summaryLines.push(`- ${post.title}: would ${action} dev.to (${post.canonicalUrl})`);
    continue;
  }

  const result = existingArticle
    ? await devtoRequest(`/articles/${existingArticle.id}`, {
        token,
        method: "PUT",
        body: articlePayload,
      })
    : await devtoRequest("/articles", {
        token,
        method: "POST",
        body: articlePayload,
      });

  console.log(`${existingArticle ? "Updated" : "Created"} dev.to article: ${result.url}`);
  summaryLines.push(`- ${post.title}: ${result.url}`);
}

await appendStepSummary(summaryLines.join("\n"));
