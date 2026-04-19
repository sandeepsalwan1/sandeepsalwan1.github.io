import { listPostFiles, normalizePostFile, appendStepSummary } from "./lib/posts.mjs";

const checkOnly = process.argv.includes("--check");
const files = await listPostFiles();
const results = [];

for (const file of files) {
  results.push(await normalizePostFile(file, { checkOnly }));
}

const changed = results.filter((result) => result.changed);

if (changed.length > 0) {
  console.log(`Normalized ${changed.length} post(s):`);
  for (const result of changed) {
    console.log(`- ${result.relativePath}`);
  }
} else {
  console.log("Frontmatter already normalized.");
}

await appendStepSummary([
  "### Frontmatter",
  changed.length > 0
    ? changed.map((result) => `- ${result.relativePath}`).join("\n")
    : "- No frontmatter changes needed.",
].join("\n"));

if (checkOnly && changed.length > 0) {
  process.exitCode = 1;
}
