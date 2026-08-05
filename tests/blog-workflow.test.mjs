import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { stripDraftWorkpad } from "../scripts/lib/drafts.mjs";
import {
  buildCanonicalUrl,
  resolveExplicitPostPath,
  slugify,
} from "../scripts/lib/posts.mjs";
import {
  pendingStrategies,
  recordStrategyResults,
} from "../scripts/lib/social-state.mjs";

const repoRoot = path.resolve(import.meta.dirname, "..");

test("slug and canonical URL stay stable", () => {
  assert.equal(slugify("AFK Coding: Less, but Better"), "afk-coding-less-but-better");
  assert.equal(
    buildCanonicalUrl("https://sandeeps.tech/", "afk-coding"),
    "https://sandeeps.tech/blog/afk-coding/",
  );
});

test("explicit publishing paths cannot escape _posts", async () => {
  const cwd = await mkdtemp(path.join(os.tmpdir(), "sandeeps-tech-path-"));
  await assert.rejects(
    resolveExplicitPostPath("_drafts/private.md", cwd),
    /inside _posts/,
  );
  assert.equal(
    await resolveExplicitPostPath("_posts/public.md", cwd),
    path.join(cwd, "_posts/public.md"),
  );
});

test("draft workpads are removed before publication", () => {
  const content = `<!-- DRAFT WORKPAD\nPrivate notes.\nEND DRAFT WORKPAD -->\n\nPublic article.`;
  assert.equal(stripDraftWorkpad(content), "Public article.");
});

test("social retries target only failures and retain successes", () => {
  const strategies = [{ id: "twitter" }, { id: "bluesky" }];
  const recorded = recordStrategyResults(
    { title: "Post" },
    strategies,
    [
      { ok: true, name: "Twitter", url: "https://example.com/post" },
      { ok: false, name: "Bluesky" },
    ],
    "2026-08-04T00:00:00.000Z",
  );

  assert.deepEqual(recorded.failures, ["bluesky"]);
  assert.deepEqual(
    pendingStrategies(strategies, recorded.entry).map((strategy) => strategy.id),
    ["bluesky"],
  );
});

test("import and promotion keep drafts isolated and strip workpads", async () => {
  const cwd = await mkdtemp(path.join(os.tmpdir(), "sandeeps-tech-draft-"));
  const sourcePath = path.join(cwd, "source.md");
  await writeFile(
    sourcePath,
    `---\ntitle: Existing Title\ndescription: Existing description.\ntags:\n  - agents\n---\n\n<!-- DRAFT WORKPAD\nPrivate notes.\nEND DRAFT WORKPAD -->\n\nPublic article.\n`,
  );

  const imported = spawnSync(
    process.execPath,
    [path.join(repoRoot, "scripts/import_post.mjs"), "--source", sourcePath],
    { cwd, encoding: "utf8" },
  );
  assert.equal(imported.status, 0, imported.stderr);

  const draftPath = path.join(cwd, "_drafts/existing-title.md");
  const draft = await readFile(draftPath, "utf8");
  assert.equal((draft.match(/^---$/gm) ?? []).length, 2);

  await writeFile(
    draftPath,
    draft.replace("slug: existing-title", "slug: '!!!'"),
  );
  const invalidPromotion = spawnSync(
    process.execPath,
    [path.join(repoRoot, "scripts/publish_draft.mjs"), "existing-title"],
    { cwd, encoding: "utf8" },
  );
  assert.notEqual(invalidPromotion.status, 0);
  assert.match(invalidPromotion.stderr, /invalid slug/);

  await writeFile(
    draftPath,
    draft.replace(
      "canonical_url: https://sandeeps.tech/blog/existing-title/",
      "canonical_url: https://sandeeps.tech/blog/stale-slug/",
    ),
  );

  const published = spawnSync(
    process.execPath,
    [path.join(repoRoot, "scripts/publish_draft.mjs"), "existing-title"],
    { cwd, encoding: "utf8" },
  );
  assert.equal(published.status, 0, published.stderr);

  const publishedPath = path.join(
    cwd,
    "_posts",
    `${new Intl.DateTimeFormat("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date())}-existing-title.md`,
  );
  const post = await readFile(publishedPath, "utf8");
  assert.doesNotMatch(post, /DRAFT WORKPAD|Private notes/);
  assert.match(post, /Public article\./);
  assert.match(post, /canonical_url: https:\/\/sandeeps\.tech\/blog\/existing-title\//);
  assert.doesNotMatch(post, /stale-slug/);
});
