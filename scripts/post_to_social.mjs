import { Client, BlueskyStrategy, DiscordStrategy, DiscordWebhookStrategy, LinkedInStrategy, MastodonStrategy, TelegramStrategy, TwitterStrategy } from "@humanwhocodes/crosspost";
import path from "node:path";
import { loadAutomationConfig } from "./lib/config.mjs";
import { appendStepSummary, getCandidatePostFiles, readJsonIfPresent, readPostFile, writeJson } from "./lib/posts.mjs";

const dryRun = process.env.DRY_RUN === "1";

function buildStrategies() {
  const strategies = [];

  if (process.env.X_API_KEY && process.env.X_API_SECRET && process.env.X_ACCESS_TOKEN && process.env.X_ACCESS_TOKEN_SECRET) {
    strategies.push(
      new TwitterStrategy({
        apiConsumerKey: process.env.X_API_KEY,
        apiConsumerSecret: process.env.X_API_SECRET,
        accessTokenKey: process.env.X_ACCESS_TOKEN,
        accessTokenSecret: process.env.X_ACCESS_TOKEN_SECRET,
      }),
    );
  }

  if (process.env.MASTODON_HOST && process.env.MASTODON_ACCESS_TOKEN) {
    strategies.push(
      new MastodonStrategy({
        host: process.env.MASTODON_HOST,
        accessToken: process.env.MASTODON_ACCESS_TOKEN,
      }),
    );
  }

  if (process.env.BLUESKY_IDENTIFIER && process.env.BLUESKY_APP_PASSWORD) {
    strategies.push(
      new BlueskyStrategy({
        host: process.env.BLUESKY_HOST || "bsky.social",
        identifier: process.env.BLUESKY_IDENTIFIER,
        password: process.env.BLUESKY_APP_PASSWORD,
      }),
    );
  }

  if (process.env.LINKEDIN_ACCESS_TOKEN) {
    strategies.push(
      new LinkedInStrategy({
        accessToken: process.env.LINKEDIN_ACCESS_TOKEN,
      }),
    );
  }

  if (process.env.DISCORD_BOT_TOKEN && process.env.DISCORD_CHANNEL_ID) {
    strategies.push(
      new DiscordStrategy({
        botToken: process.env.DISCORD_BOT_TOKEN,
        channelId: process.env.DISCORD_CHANNEL_ID,
      }),
    );
  } else if (process.env.DISCORD_WEBHOOK_URL) {
    strategies.push(
      new DiscordWebhookStrategy({
        webhookUrl: process.env.DISCORD_WEBHOOK_URL,
      }),
    );
  }

  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
    strategies.push(
      new TelegramStrategy({
        botToken: process.env.TELEGRAM_BOT_TOKEN,
        chatId: process.env.TELEGRAM_CHAT_ID,
      }),
    );
  }

  return strategies;
}

function buildHashtags(post) {
  const hashtags = post.tags
    .slice(0, 3)
    .map((tag) => `#${String(tag).replace(/[^a-zA-Z0-9]/g, "")}`)
    .filter((tag) => tag.length > 1)
    .join(" ");

  return hashtags;
}

function buildLines(post, { includeExtraLinks = true, includeHashtags = true } = {}) {
  const lines = [post.title, `Read: ${post.canonicalUrl}`];

  if (includeExtraLinks) {
    for (const link of post.socialLinks) {
      lines.push(`${link.label}: ${link.url}`);
    }
  }

  if (includeHashtags) {
    const hashtags = buildHashtags(post);
    if (hashtags) {
      lines.push(hashtags);
    }
  }

  return lines;
}

function fitsAllStrategies(message, strategies) {
  return strategies.every((strategy) => {
    if (typeof strategy.calculateMessageLength !== "function") {
      return true;
    }

    const maxLength = Number(strategy.MAX_MESSAGE_LENGTH);
    if (!Number.isFinite(maxLength) || maxLength <= 0) {
      return true;
    }

    return strategy.calculateMessageLength(message) <= maxLength;
  });
}

function truncateTitleToFit(post, strategies, { includeExtraLinks, includeHashtags }) {
  const reservedLines = buildLines(
    {
      ...post,
      title: "",
    },
    { includeExtraLinks, includeHashtags },
  );

  for (let maxTitleLength = post.title.length; maxTitleLength >= 32; maxTitleLength -= 4) {
    const shortenedTitle =
      post.title.length <= maxTitleLength
        ? post.title
        : `${post.title.slice(0, Math.max(0, maxTitleLength - 3)).trimEnd()}...`;
    const message = [shortenedTitle, ...reservedLines.slice(1)].join("\n");
    if (fitsAllStrategies(message, strategies)) {
      return message;
    }
  }

  return null;
}

function buildMessage(post, strategies) {
  const candidates = [
    buildLines(post, { includeExtraLinks: true, includeHashtags: true }).join("\n"),
    buildLines(post, { includeExtraLinks: true, includeHashtags: false }).join("\n"),
    buildLines(post, { includeExtraLinks: false, includeHashtags: true }).join("\n"),
    buildLines(post, { includeExtraLinks: false, includeHashtags: false }).join("\n"),
  ];

  for (const candidate of candidates) {
    if (fitsAllStrategies(candidate, strategies)) {
      return candidate;
    }
  }

  return (
    truncateTitleToFit(post, strategies, {
      includeExtraLinks: false,
      includeHashtags: false,
    }) ||
    `${post.title}\n${post.canonicalUrl}`
  );
}

const config = await loadAutomationConfig();
const enabled = config.platforms.social?.enabled !== false;

if (!enabled) {
  console.log("Social publishing disabled in config.yml.");
  process.exit(0);
}

const strategies = buildStrategies();
if (strategies.length === 0) {
  console.log("No social strategies configured. Skipping social cross-post.");
  process.exit(0);
}

const files = await getCandidatePostFiles({
  addedOnly: true,
  fallbackToLatest: process.env.POST_PATH ? false : dryRun,
});
const posts = [];
for (const file of files) {
  posts.push(await readPostFile(file));
}

if (posts.length === 0) {
  console.log("No newly added posts detected for social cross-post.");
  process.exit(0);
}

const statePath = path.join(process.cwd(), config.platforms.social?.state_file ?? ".automation/social-post-state.json");
const state = await readJsonIfPresent(statePath, {});
const client = new Client({ strategies });
const summaryLines = [dryRun ? "### Social Dry Run" : "### Social Cross-post"];

for (const post of posts) {
  if (state[post.canonicalUrl]) {
    console.log(`Already cross-posted: ${post.canonicalUrl}`);
    summaryLines.push(`- skipped ${post.title}: already posted`);
    continue;
  }

  const message = buildMessage(post, strategies);
  if (dryRun) {
    console.log(`Would cross-post: ${message}`);
    summaryLines.push(`- ${post.title}: would post to ${strategies.map((strategy) => strategy.id).join(", ")}`);
    continue;
  }

  const result = await client.post(message);
  state[post.canonicalUrl] = {
    postedAt: new Date().toISOString(),
    title: post.title,
    result,
  };

  console.log(`Cross-posted: ${post.title}`);
  summaryLines.push(`- ${post.title}: posted to ${strategies.map((strategy) => strategy.id).join(", ")}`);
}

await writeJson(statePath, state);
await appendStepSummary(summaryLines.join("\n"));
