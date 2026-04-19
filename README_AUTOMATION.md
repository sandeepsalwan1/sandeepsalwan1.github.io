# Automation

Blog publishing is wired around `config.yml`.

If you want the ultra-simple version, read [EASY_POSTING_GUIDE.md](/Users/sandeep/projects/sandeepsalwan1.github.io-6/EASY_POSTING_GUIDE.md).

## Setup

1. Keep writing posts in `_posts/` using Markdown frontmatter.
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

## Commands

- `npm run post:import -- --source "/full/path/to/draft.txt" --tags "ai,llm"`
- `npm run post:new -- --title "My New Post" --description "Short summary" --tags "ai,llm"`
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

- Push a new markdown file under `_posts/` to `main` and CI will auto-publish it.
- For a manual run, open the `Blog Publish` workflow, set `post_path`, and optionally enable `dry_run`.

## Notes

- `canonical_url` is filled automatically from `https://sandeeps.tech/blog/{slug}/` when missing.
- Medium stays disabled by default until a working token is available.
- Social fan-out caches `.automation/social-post-state.json` in CI so reruns do not repost the same canonical URL.
- Publish scripts do not fall back to the latest post on CI anymore; they only act on changed posts or an explicit `POST_PATH`.
