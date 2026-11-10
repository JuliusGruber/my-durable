# Agent Instructions

## Deployment

- Cloudflare Worker: `my-durable`.
- Production URL: https://my-durable.julius-gruber.workers.dev/.
- Cloudflare account ID: `5903579054d2c0026860b7f48555657c`.
- Configuration: `wrangler.jsonc`. Build and deploy with `pnpm deploy`.

## Storage

- Each session uses a SQLite-backed Durable Object.
- Binding: `SESSIONS`; class: `Session`.
- Production namespace: `my-durable_Session`.
- Namespace ID: `1537ac0e29b142798455ef5dd7e1fd84`.
- In Cloudflare Data Studio, select this namespace and open an object by its session ID to inspect its SQLite tables.

## Access

- Wrangler authentication and Cloudflare dashboard sign-in are separate.
- Check CLI authentication with `pnpm exec wrangler whoami`; authenticate with `pnpm exec wrangler login` when needed.
- Read deployment history with `pnpm exec wrangler deployments list --name my-durable`.
- Stream production logs with `pnpm exec wrangler tail my-durable --format json`.
- The browser automation profile used for dashboard access is `/home/julius-gruber/.cache/ms-playwright/mcp-chrome-86d03a7`.
- Use `playwright-cli list` to find an existing browser session. If none exists, open the profile with `playwright-cli -s=cloudflare-access open --headed --profile=/home/julius-gruber/.cache/ms-playwright/mcp-chrome-86d03a7 https://dash.cloudflare.com/`. Verify dashboard sign-in before accessing Data Studio.

## Git Workflow

This repository follows a continuous commit-and-push workflow:

- **Commit every change as soon as it is complete.** Don't batch unrelated
  changes together or let finished work sit uncommitted — each logical change
  gets its own commit with a clear, descriptive message.
- **Push immediately after every commit.** The remote is the source of truth;
  local work should never be more than one commit ahead of it.

The intent: the remote always reflects the current state of the work, every
change is individually traceable, and nothing is ever lost to an uncommitted
working tree.
