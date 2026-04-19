import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const repo = "sandeepsalwan1/sandeepsalwan1.github.io";

const groups = [
  {
    label: "Core blog publishing",
    required: true,
    sets: [["DEVTO_TOKEN"], ["HASHNODE_TOKEN"], ["HASHNODE_PUBLICATION_ID"]],
  },
  {
    label: "X",
    required: false,
    sets: [["X_API_KEY", "X_API_SECRET", "X_ACCESS_TOKEN", "X_ACCESS_TOKEN_SECRET"]],
  },
  {
    label: "Mastodon",
    required: false,
    sets: [["MASTODON_HOST", "MASTODON_ACCESS_TOKEN"]],
  },
  {
    label: "Bluesky",
    required: false,
    sets: [["BLUESKY_HOST", "BLUESKY_IDENTIFIER", "BLUESKY_APP_PASSWORD"]],
  },
  {
    label: "LinkedIn",
    required: false,
    sets: [["LINKEDIN_ACCESS_TOKEN"]],
  },
  {
    label: "Discord",
    required: false,
    sets: [
      ["DISCORD_WEBHOOK_URL"],
      ["DISCORD_BOT_TOKEN", "DISCORD_CHANNEL_ID"],
    ],
  },
  {
    label: "Telegram",
    required: false,
    sets: [["TELEGRAM_BOT_TOKEN", "TELEGRAM_CHAT_ID"]],
  },
];

function isGroupSatisfied(group, names) {
  return group.sets.some((secretSet) => secretSet.every((secret) => names.has(secret)));
}

function missingSets(group, names) {
  return group.sets
    .map((secretSet) => secretSet.filter((secret) => !names.has(secret)))
    .filter((missing) => missing.length > 0);
}

const { stdout } = await execFileAsync("gh", ["secret", "list", "-R", repo], {
  cwd: process.cwd(),
});

const names = new Set(
  stdout
    .split("\n")
    .map((line) => line.split("\t")[0]?.trim())
    .filter(Boolean),
);

console.log(`GitHub repo secrets for ${repo}`);
console.log("");

for (const group of groups) {
  const ok = isGroupSatisfied(group, names);
  console.log(`${ok ? "OK" : group.required ? "MISSING" : "NOT SET"} ${group.label}`);

  if (!ok) {
    const missing = missingSets(group, names);
    for (const option of missing) {
      console.log(`  need: ${option.join(", ")}`);
    }
  }
}

console.log("");
console.log("Raw secrets currently present:");
for (const name of [...names].sort()) {
  console.log(`- ${name}`);
}
