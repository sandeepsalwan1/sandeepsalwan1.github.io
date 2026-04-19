# Easy Posting Guide

This is the stupid-simple version.

## What already works

- Your own site: `sandeeps.tech`
- dev.to
- Hashnode
- Manual dry-run checks
- Auto-run GitHub Action

## What still needs keys from you if you want “post everywhere”

- X: `X_API_KEY`, `X_API_SECRET`, `X_ACCESS_TOKEN`, `X_ACCESS_TOKEN_SECRET`
- Mastodon: `MASTODON_HOST`, `MASTODON_ACCESS_TOKEN`
- Bluesky: `BLUESKY_HOST`, `BLUESKY_IDENTIFIER`, `BLUESKY_APP_PASSWORD`
- LinkedIn: `LINKEDIN_ACCESS_TOKEN`
- Discord: easiest is `DISCORD_WEBHOOK_URL`
- Telegram: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`

If those are not set, the blog still posts to your site, dev.to, and Hashnode. It just skips the missing socials.

## The easiest way to use it

### Option 1: easiest possible

1. Make a new post file:

```bash
npm run post:new -- --title "My New Post" --description "One line summary" --tags "ai,llm"
```

2. Open the file it prints.
3. Write the post.
4. Commit and push to `main`.
5. Done. GitHub Actions auto-posts it.

### Option 1B: start from a `.txt` or `.md` draft you already wrote

If you already wrote something in Notes, TextEdit, Cursor, or anywhere else:

```bash
npm run post:import -- --source "/full/path/to/your-draft.txt" --tags "ai,llm"
```

Or for markdown:

```bash
npm run post:import -- --source "/full/path/to/your-draft.md" --tags "ai,llm"
```

That creates the ready-to-publish `_posts/...md` file automatically.

### Option 2: manual button in GitHub

1. Push your post branch.
2. Open GitHub Actions.
3. Open `Blog Publish`.
4. Click `Run workflow`.
5. Put the exact file path in `post_path`.

Example:

```text
_posts/2026-04-18-my-post.md
```

6. If you want a safe test first, turn on `dry_run`.
7. Run it.

## The safest test flow

Run these before real publishing if you want to be extra safe:

```bash
npm run post:import -- --source "/full/path/to/draft.txt" --tags "ai,llm"
npm run check:setup
npm run verify:automation
DRY_RUN=1 POST_PATH=_posts/2026-04-15-what-i-look-for-in-agentic-products.md npm run publish:devto
DRY_RUN=1 POST_PATH=_posts/2026-04-15-what-i-look-for-in-agentic-products.md npm run publish:hashnode
DRY_RUN=1 POST_PATH=_posts/2026-04-15-what-i-look-for-in-agentic-products.md npm run post:social
```

## Real publish commands

```bash
POST_PATH=_posts/2026-04-15-what-i-look-for-in-agentic-products.md npm run publish:devto
POST_PATH=_posts/2026-04-15-what-i-look-for-in-agentic-products.md npm run publish:hashnode
POST_PATH=_posts/2026-04-15-what-i-look-for-in-agentic-products.md npm run post:social
```

Most of the time you should not need these. Pushing to `main` is enough.

## What I need from you

If you want every network connected, send me the keys below or add them as GitHub repo secrets yourself.

| Platform | Secret names | Where to get it |
|---|---|---|
| dev.to | `DEVTO_TOKEN` | dev.to Settings → Extensions → API key |
| Hashnode | `HASHNODE_TOKEN`, `HASHNODE_PUBLICATION_ID` | Hashnode Settings → Developer token, plus your publication id |
| X | `X_API_KEY`, `X_API_SECRET`, `X_ACCESS_TOKEN`, `X_ACCESS_TOKEN_SECRET` | X Developer Console → App → Keys and tokens |
| Mastodon | `MASTODON_HOST`, `MASTODON_ACCESS_TOKEN` | Your Mastodon server → Preferences/Edit Profile → Development → New application |
| Bluesky | `BLUESKY_HOST`, `BLUESKY_IDENTIFIER`, `BLUESKY_APP_PASSWORD` | Bluesky Settings → Advanced → App Passwords |
| LinkedIn | `LINKEDIN_ACCESS_TOKEN` | LinkedIn Developers → your app → add “Share on LinkedIn” → generate token with `w_member_social` |
| Discord | `DISCORD_WEBHOOK_URL` or `DISCORD_BOT_TOKEN` + `DISCORD_CHANNEL_ID` | Discord server/channel Integrations → Webhooks, or Discord Developer Portal for bot |
| Telegram | `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | Create bot with `@BotFather`, then get channel/chat id |

Official links:

- X: `https://docs.x.com/x-api/getting-started/getting-access`
- Mastodon: `https://docs.joinmastodon.org/api/oauth-tokens/`
- Bluesky bots/auth: `https://docs.bsky.app/docs/starter-templates/bots`
- LinkedIn Share on LinkedIn: `https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin`
- Discord webhooks: `https://docs.discord.com/developers/platform/webhooks`
- Discord bots: `https://docs.discord.com/developers/bots`
- Telegram bots: `https://core.telegram.org/bots/features`

## Best recommendation

- Do this first: site + dev.to + Hashnode
- Add next: Discord webhook
- Add after that: Bluesky + Mastodon
- Add later if you want: X + LinkedIn + Telegram

That order is fastest and least annoying.

## One-command status check

```bash
npm run check:setup
```

It tells you exactly which secrets are still missing.

## Important

- Do not paste secrets into the repo.
- Put them in GitHub repo secrets only.
- If a token was pasted in chat, rotate it after setup.
