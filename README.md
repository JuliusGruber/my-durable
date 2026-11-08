# my-durable

A [`@earendil-works/pi-durable`](https://www.npmjs.com/package/@earendil-works/pi-durable) agent running on Cloudflare Workers and Durable Objects.

This project is based on the official [pi-durable-cloudflare](https://github.com/earendil-works/pi-durable-cloudflare) example from Earendil Works (MIT, see [LICENSE](LICENSE)). The [Pi Durable announcement](https://earendil.com/posts/pi-durable/) explains the ideas behind the harness.

Pi Durable is experimental, so its APIs may still change.

## What it does

- Shared chat sessions that can be opened in multiple browsers at once.
- Several conversations per session, with forking from an earlier message.
- Reconnects without losing committed transcripts or queued prompts.
- One-time and recurring scheduled follow-ups via Durable Object alarms.
- A search subagent that can answer questions about earlier conversations.
- An Activity panel showing live task ownership, waits, sleeps, tool calls, and background work, with retry for tasks parked after repeated crashes.

There is no authentication or rate limiting yet. Add both before exposing a deployment: anyone who can reach the Worker can create sessions that use your model credentials.

## Layout

- [`src/chat.ts`](src/chat.ts) defines the models, extensions, tools, and default agent.
- [`src/session.ts`](src/session.ts) hosts the harness in a SQLite-backed Durable Object and wires it to hibernating WebSockets and alarms.
- [`src/index.ts`](src/index.ts) is the Worker entry point and routes `/api/sessions` to the Durable Object.
- [`src/tools.ts`](src/tools.ts), [`src/schedule.ts`](src/schedule.ts), and [`src/search.ts`](src/search.ts) contain the tools and tasks.
- [`src/client/`](src/client/) is the React client and its event-driven session state.
- [`test/`](test/) covers restart recovery, scheduling, forks, inboxes, and the client.
- [`wrangler.jsonc`](wrangler.jsonc) is the Cloudflare configuration (Worker name, Durable Object binding, static assets).

## Run it locally

You need Node.js 22.19 or newer, pnpm 11, and an Anthropic API key.

```sh
pnpm install
cp .dev.vars.example .dev.vars
```

Add your key to `.dev.vars`:

```dotenv
ANTHROPIC_API_KEY=your-key
```

Then start the Worker and React client together:

```sh
pnpm dev
```

Open the local URL printed by Vite, create a session, and send a message. Open the session URL in another browser to try the multiplayer flow.

## Commands

```sh
pnpm dev        # local development
pnpm test       # test suite (runs inside workerd via the Cloudflare Vitest plugin)
pnpm check      # formatting, types, build, and deploy dry run
pnpm build      # production build
pnpm preview    # preview the production build locally
pnpm deploy     # build and deploy to Cloudflare
```

## Deploy to Cloudflare

The Worker is named `my-durable` in [`wrangler.jsonc`](wrangler.jsonc). If your Cloudflare project already has a Worker with a different name, change the `name` field there so Wrangler deploys into it instead of creating a new Worker.

### From the Cloudflare dashboard (no local machine needed)

[Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/) builds and deploys this repository on every push:

1. In the Cloudflare dashboard open **Workers & Pages**, select the `my-durable` Worker, then **Settings** > **Build** and connect this GitHub repository.
2. Choose the branch to deploy from, set the build command to `pnpm build` and the deploy command to `pnpm exec wrangler deploy`. Leave the root directory empty. The build image picks up `pnpm@11.15.1` from `package.json` and its default Node.js satisfies the project.
3. Under **Settings** > **Variables and Secrets** add a secret named `ANTHROPIC_API_KEY`.
4. Trigger a build from the **Deployments** tab, or push a commit.

### From a machine with Wrangler

Authenticate Wrangler, store the API key as a Worker secret, then deploy:

```sh
pnpm exec wrangler login
pnpm exec wrangler secret put ANTHROPIC_API_KEY
pnpm deploy
```

The first deploy creates the `Session` Durable Object class with SQLite storage. Durable Objects require a Workers paid plan or the free tier's SQLite-backed Durable Objects.

The default agent runs Claude Opus 5.5 (`claude-opus-5-5`) through the Anthropic API with low thinking effort. To change the model or provider, edit `createChatHarnessOptions` in [`src/chat.ts`](src/chat.ts) and add the matching secret.

## Further reading

- [Pi Durable announcement](https://earendil.com/posts/pi-durable/)
- [pi-durable package documentation](https://github.com/earendil-works/pi/tree/main/packages/durable)
- [pi-durable examples](https://github.com/earendil-works/pi/tree/main/packages/durable/test/examples)
- [Cloudflare Durable Objects](https://developers.cloudflare.com/durable-objects/)
