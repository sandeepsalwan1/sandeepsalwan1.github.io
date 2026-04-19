import { loadAutomationConfig } from "./lib/config.mjs";
import { getCandidatePostFiles, readPostFile } from "./lib/posts.mjs";

const config = await loadAutomationConfig();
const files = await getCandidatePostFiles({ addedOnly: false, fallbackToLatest: true });
const posts = [];

for (const file of files) {
  posts.push(await readPostFile(file));
}

console.log("Automation config");
console.log(JSON.stringify(config, null, 2));

if (posts.length === 0) {
  console.log("No candidate posts found.");
  process.exit(0);
}

console.log("Candidate posts");
for (const post of posts) {
  console.log(`- ${post.relativePath}`);
  console.log(`  title: ${post.title}`);
  console.log(`  canonical: ${post.canonicalUrl}`);
  console.log(`  devto: ${post.data.publish_devto !== false}`);
  console.log(`  hashnode: ${post.data.publish_hashnode !== false}`);
}

console.log("");
console.log("Run these for safe API verification:");
console.log(`DRY_RUN=1 POST_PATH=${posts[0].relativePath} npm run publish:devto`);
console.log(`DRY_RUN=1 POST_PATH=${posts[0].relativePath} npm run publish:hashnode`);
console.log(`DRY_RUN=1 POST_PATH=${posts[0].relativePath} npm run post:social`);
