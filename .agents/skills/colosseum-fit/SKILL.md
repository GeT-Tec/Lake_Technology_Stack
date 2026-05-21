---
name: colosseum-fit
version: 1.0.0
description: Find which Solana Colosseum Frontier hackathon side tracks a project fits — already, or with reasonable extensions. Use when the user says "find side tracks", "what side tracks can I apply to", "colosseum fit", "frontier side tracks", or asks how their project maps to the Frontier hackathon bounty tracks.
---

# Colosseum Fit

Match a Solana project to topic-focused side tracks from the Colosseum Frontier hackathon (sponsored bounties on Superteam Earn). Regional/location-gated tracks are excluded — only topic tracks where eligibility is `Global` are considered.

Source: https://superteam.fun/earn/hackathon/frontier

## When to use

User asks any of:
- "What side tracks can I apply to?"
- "Find Colosseum / Frontier side tracks for this project"
- "Is my project a fit for any Frontier bounties?"
- "Map my project to the Frontier hackathon tracks"

If the user invokes this outside a project directory, ask for a project description (one paragraph + tech stack + main features) before proceeding.

## Workflow

### 1. Gather project context

Read whatever's available in the current working directory, in order of usefulness:
1. `README.md` / `README*` — the project's own framing
2. `package.json`, `Cargo.toml`, `Anchor.toml`, `pyproject.toml` — stack signal
3. `programs/`, `app/`, `src/` directory listings — feature surface
4. Recent commits (`git log --oneline -20`) — what they've been working on
5. Any `pitch.md`, `description.md`, hackathon submission drafts

Build a one-paragraph internal summary covering:
- **What it does** (the user-facing product)
- **Tech stack** (Solana? Anchor? Rust? TS? Mobile? AI? Indexer?)
- **Core primitives used** (payments, swaps, DEX, NFTs, identity, privacy, agents, data, infra, etc.)
- **Current status** (MVP / live / demo)

If the directory has none of this signal (e.g. fresh repo, empty README), ask the user for a project pitch before continuing — do not guess.

### 2. Load tracks

Locate the bundled data file (it sits in `data/tracks.json` alongside this SKILL.md). The exact install path depends on the agent — find it like this:

```bash
find ~ ./ -maxdepth 8 -path '*colosseum-fit/data/tracks.json' 2>/dev/null | head -1
```

Then `cat` the path it returns. The JSON contains a `tracks` array; each track has `slug`, `title`, `sponsor`, `reward`, `deadline`, `skills`, `description`, `url`.

The snapshot is dated (`fetched_at` field). If the user asks about *currentness* — or if it's been more than a couple weeks since `fetched_at` — tell them the data is from that date and remind them to verify on superteam.fun before submitting.

### 3. Judge fit for each track

For every track, decide one of:

- **APPLIES** — the project, as it exists today, plausibly satisfies the track's prompt. The submission would be: "here's our project, here's how it does the thing the track wants."
- **EXTENDABLE** — the project doesn't fit today, but a *reasonable* extension would. "Reasonable" means: the extension is in the same direction as the project's mission, uses adjacent tech, and is plausibly buildable in the remaining hackathon time. Bolting a track-specific feature onto an unrelated project is **not** reasonable — skip those.
- **SKIP** — wrong domain, conflicting requirements, or the only way to fit is to pivot the whole project.

Be honest, not promotional. The user wants accurate signal so they don't waste submissions on bad-fit tracks. When in doubt between APPLIES and EXTENDABLE, downgrade — better to under-promise.

**Read the full description, not just the title.** Several tracks have a specific ask buried in the body (e.g. "must use Solflare wallet adapter", "must integrate Dune dashboard", "submission requires a deployed mainnet contract"). Hard requirements override surface-level keyword matches.

### 4. Output

Format the result as two sections, sorted by reward (highest first) within each:

```
## Already a fit (N tracks)

### $X,XXX — Track Title  (sponsor)
**Why it fits:** 1-2 sentences pointing at concrete project evidence (file, feature, README claim).
**Watch out for:** any hard requirement they still need to verify (deployment, specific integration, code disclosure, etc.).
**Deadline:** YYYY-MM-DD  |  **Link:** https://superteam.fun/earn/listing/...

## Fits with reasonable work (N tracks)

### $X,XXX — Track Title  (sponsor)
**Why it could fit:** what the project already has going for it.
**What to add:** the specific extension (1-3 bullets, concrete). Rough effort estimate ("~1 day", "~weekend", "~week").
**Deadline:** YYYY-MM-DD  |  **Link:** ...
```

Then a final one-liner: how many regional tracks were skipped (from `tracks.json` → `skipped_regional`), and that the user can apply to those separately if they live in a matching country.

### Output rules

- **No filler matches.** If only 3 tracks fit, return 3. Do not pad.
- **No vague justifications** like "this could align well with the privacy theme." Cite specifics: a file, a feature, a stack item.
- **For EXTENDABLE tracks, the addition must serve the project's existing direction.** Don't suggest a user rewrite their DeFi protocol to be a memecoin launcher just because there's a $500 bounty for it.
- **Surface multi-track conflicts** at the bottom if you spot them (e.g. some sponsors require exclusivity; check each track's description).
- Keep each entry under 6 lines. The user is going to read all of them.

## Data freshness

`tracks.json` is a static snapshot. Sponsors may add new tracks, change prizes, or extend deadlines after the snapshot was taken. Always link the user back to the live listing so they verify the current state before they submit.

To refresh the snapshot manually, locate the script and run it:

```bash
SKILL_DIR="$(find ~ ./ -maxdepth 8 -type d -name colosseum-fit 2>/dev/null | head -1)"
python3 "$SKILL_DIR/scripts/scrape.py"
```

This re-fetches the index and every listing page, drops regional tracks, and rewrites `data/tracks.json`.

## What's excluded

Regional tracks (region != "Global") are stripped at scrape time and are **not** in `tracks.json`. The list of skipped regional tracks is preserved in `tracks.json` → `skipped_regional` so you can tell the user "X regional tracks were excluded — if you live in one of these countries, check superteam.fun directly: ...".
