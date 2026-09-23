import { setTimeout as delay } from "node:timers/promises";
import { getCandidatePostFiles, readPostFile } from "./lib/posts.mjs";

const dryRun = process.env.DRY_RUN === "1";
const timeoutMs = Number(process.env.WAIT_TIMEOUT_SECONDS || 720) * 1000;
const intervalMs = Number(process.env.WAIT_INTERVAL_SECONDS || 10) * 1000;
const repository = process.env.GITHUB_REPOSITORY;
const revision = process.env.GITHUB_SHA;
const token = process.env.GITHUB_TOKEN;

async function githubRequest(pathname) {
  const response = await fetch(`https://api.github.com${pathname}`, {
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${token}`,
      "user-agent": "sandeeps-tech-publish-check/1.0",
      "x-github-api-version": "2022-11-28",
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API ${pathname} failed: ${response.status}`);
  }

  return response.json();
}

async function waitForPagesDeployment(deadline) {
  if (!repository || !revision || !token) {
    throw new Error("GITHUB_REPOSITORY, GITHUB_SHA, and GITHUB_TOKEN are required for canonical deployment proof.");
  }

  const query = new URLSearchParams({
    sha: revision,
    environment: "github-pages",
    per_page: "10",
  });

  while (Date.now() < deadline) {
    const deployments = await githubRequest(`/repos/${repository}/deployments?${query}`);
    const deployment = deployments.find(
      (candidate) => candidate.sha === revision && candidate.environment === "github-pages",
    );

    if (deployment) {
      const statuses = await githubRequest(`/repos/${repository}/deployments/${deployment.id}/statuses`);
      const state = statuses[0]?.state;
      if (state === "success") {
        console.log(`GitHub Pages deployed exact revision: ${revision}`);
        return;
      }
      if (state === "failure" || state === "error") {
        throw new Error(`GitHub Pages deployment ${deployment.id} ended in ${state}.`);
      }
      console.log(`Waiting for GitHub Pages revision ${revision}: ${state || "deployment created"}`);
    } else {
      console.log(`Waiting for GitHub Pages deployment: ${revision}`);
    }

    await delay(intervalMs);
  }

  throw new Error(`GitHub Pages did not deploy revision ${revision} before timeout.`);
}

if (dryRun) {
  console.log("Dry run: canonical deployment wait skipped.");
  process.exit(0);
}

const files = await getCandidatePostFiles({ addedOnly: false, fallbackToLatest: false });
const posts = await Promise.all(files.map((file) => readPostFile(file)));

if (posts.length === 0) {
  console.log("No changed posts detected. Canonical deployment wait skipped.");
  process.exit(0);
}

const pending = new Map(posts.map((post) => [post.canonicalUrl, post]));
const deadline = Date.now() + timeoutMs;
await waitForPagesDeployment(deadline);

while (pending.size > 0 && Date.now() < deadline) {
  for (const [canonicalUrl] of pending) {
    try {
      const response = await fetch(canonicalUrl, {
        headers: {
          "cache-control": "no-cache",
          "user-agent": "sandeeps-tech-publish-check/1.0",
        },
        redirect: "follow",
      });
      const html = response.ok ? await response.text() : "";
      const canonicalReady = html.includes('rel="canonical"') && html.includes(canonicalUrl);

      if (response.ok && canonicalReady) {
        console.log(`Canonical page ready: ${canonicalUrl}`);
        pending.delete(canonicalUrl);
      } else {
        console.log(`Waiting for canonical page: ${canonicalUrl} (${response.status})`);
      }
    } catch (error) {
      console.log(`Waiting for canonical page: ${canonicalUrl} (${error.message})`);
    }
  }

  if (pending.size > 0 && Date.now() < deadline) {
    await delay(intervalMs);
  }
}

if (pending.size > 0) {
  throw new Error(`Canonical page did not become ready before timeout:\n${[...pending.keys()].join("\n")}`);
}
