# colosseum-fit

[![skills.sh](https://skills.sh/b/AiltonSavio/colosseum-fit)](https://skills.sh/AiltonSavio/colosseum-fit)

An [agent skill](https://skills.sh) that matches a Solana project to topic-focused side tracks of the [Colosseum Frontier hackathon](https://superteam.fun/earn/hackathon/frontier).

Point your AI coding agent at a project repo, ask it to "find side tracks for this project", and the skill scores every topic bounty — telling you which ones the project **already fits** versus which it could fit **with a reasonable extension**, ranked by reward and with concrete justification.

Regional/location-gated tracks are excluded — only `region: Global` tracks are scored.

## Install

```bash
npx skills add AiltonSavio/colosseum-fit
```

Works in Claude Code, Cursor, Codex, Copilot, Windsurf, Gemini, Cline, Opencode, and 20+ other agents. See the [skills CLI](https://skills.sh) for per-agent flags.

To install globally (available across all projects):

```bash
npx skills add AiltonSavio/colosseum-fit -g
```

## Usage

In any project repo, ask your agent:

> Find Colosseum Frontier side tracks for this project.

The skill will read your project context (README, package.json, Cargo.toml, recent commits, etc.), then output two sections — **Already a fit** and **Fits with reasonable work** — each entry annotated with reward, deadline, why it fits, and (for extensions) what to add and rough effort.

If invoked outside a project repo, the skill will ask for a project pitch first.

## What's covered

21 topic tracks, totaling ~$148,915 in prizes. A few highlights:

- **$50,000** — Adevar Labs security audit credits
- **$20,000** — Build a live dApp with Solflare / Kamino / DFlow / Quicknode / Birdeye (Eitherway)
- **$15,000** — Encrypt & Ika — bridgeless / encrypted capital markets
- **$10,000** — Tether · Visa · Umbra · 100xDevs · Palm USD · theMiracle · RPC credits
- **$6,000** — Dune Analytics dashboards
- **$5,000** — Cloak privacy · SNS Identity · MagicBlock privacy · Zerion onchain agents
- **$3,000** — Torque MCP · GoldRush (Covalent) · Not Your Regular Bounty
- Plus KIRAPAY, SagaPad, LPAgent, dum.fun, and others

33 regional tracks (Superteam Turkey/Japan/Brasil/India/etc.) are deliberately excluded since eligibility there is location-based rather than topic-based. If you live in one of those regions, check [superteam.fun](https://superteam.fun/earn/hackathon/frontier) directly.

## Data freshness

`data/tracks.json` is a snapshot — see its `fetched_at` field. Sponsors may add tracks, change prizes, or extend deadlines after the snapshot was taken. Always verify on the live listing before submitting.

To regenerate the snapshot:

```bash
python3 scripts/scrape.py
```

Hits the Superteam Earn API for the track index, fetches each listing's `__NEXT_DATA__` blob, filters non-Global regions, and rewrites `data/tracks.json`. Requires Python 3, no external dependencies.

## How matching works

The skill instructs the agent to:

1. Read project context from common files (`README.md`, manifests, recent commits)
2. Load the baked track data
3. For each track, judge fit honestly — **APPLIES**, **EXTENDABLE**, or **SKIP** — based on the full track description (not just title keywords)
4. For EXTENDABLE matches, require that the proposed extension genuinely fits the project's direction; bolt-ons that pivot the project are dropped

Output is sorted by reward, with concrete evidence pinned to each match.

## License

MIT
