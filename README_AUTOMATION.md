# Automation

Blog publishing is wired around `config.yml`.

If you want the ultra-simple version, read [EASY_POSTING_GUIDE.md](EASY_POSTING_GUIDE.md).

## Setup

1. Keep writing drafts in `_drafts/` using Markdown frontmatter.
2. Review `config.yml` or copy `config.example.yml` if you want a fresh baseline.
3. Add GitHub Actions secrets:
   - `DEVTO_TOKEN`
   - `HASHNODE_TOKEN`
   - `HASHNODE_PUBLICATION_ID`
   - Optional social secrets:
     - `X_API_KEY`
     - `X_API_SECRET`
     - `X_ACCESS_TOKEN`
     - `X_ACCESS_TOKEN_SECRET`
     - `MASTODON_HOST`
     - `MASTODON_ACCESS_TOKEN`
     - `BLUESKY_HOST`
     - `BLUESKY_IDENTIFIER`
     - `BLUESKY_APP_PASSWORD`
     - `LINKEDIN_ACCESS_TOKEN`
     - `DISCORD_BOT_TOKEN`
     - `DISCORD_CHANNEL_ID`
     - `DISCORD_WEBHOOK_URL`
     - `TELEGRAM_BOT_TOKEN`
     - `TELEGRAM_CHAT_ID`

Hashnode API publishing requires an active Pro plan on the target publication.

## Commands

- `npm run draft:import -- --source "/full/path/to/draft.txt" --tags "ai,llm"`
- `npm run draft:new -- --title "My New Post" --description "Short summary" --tags "ai,llm"`
- `npm run draft:publish -- my-new-post`
- `npm run normalize:frontmatter`
- `npm run publish:devto`
- `npm run publish:hashnode`
- `npm run post:social`
- `npm run verify:automation`

## Safe Verification

- Dry-run a single post to dev.to:
  `DRY_RUN=1 POST_PATH=_posts/2026-04-15-what-i-look-for-in-agentic-products.md npm run publish:devto`
- Dry-run a single post to Hashnode:
  `DRY_RUN=1 POST_PATH=_posts/2026-04-15-what-i-look-for-in-agentic-products.md npm run publish:hashnode`
- Dry-run social fan-out:
  `DRY_RUN=1 POST_PATH=_posts/2026-04-15-what-i-look-for-in-agentic-products.md npm run post:social`
- Real publish of one post:
  `POST_PATH=_posts/2026-04-15-what-i-look-for-in-agentic-products.md npm run publish:devto`
  `POST_PATH=_posts/2026-04-15-what-i-look-for-in-agentic-products.md npm run publish:hashnode`

## GitHub Actions

- Pushing a file under `_drafts/` stores the draft in public Git history without publishing the site or any syndication target.
- `npm run draft:publish -- <draft-name>` promotes a checked draft into a dated `_posts/` file and removes its editorial workpad.
- Push the promoted `_posts/` file to `main` and CI waits for the canonical page before publishing to dev.to, Hashnode, and configured social targets.
- For a manual run, open the `Blog Publish` workflow, set `post_path`, and optionally enable `dry_run`.

## Notes

- `canonical_url` is filled automatically from `https://sandeeps.tech/blog/{slug}/` when missing.
- Medium stays disabled by default until a working token is available.
- Social fan-out records success per target, so a retry only repeats failed targets.
- X, Mastodon, and Bluesky are required in this repository; missing credentials fail the run instead of silently skipping them.
- LinkedIn, Discord, and Telegram activate automatically when their documented secrets are added.
- Publish scripts do not fall back to the latest post on CI anymore; they only act on changed posts or an explicit `POST_PATH`.
