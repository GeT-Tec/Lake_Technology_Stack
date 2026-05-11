#!/usr/bin/env python3
"""One-shot scraper for Colosseum Frontier side tracks.

Fetches the track index, then each listing's __NEXT_DATA__ blob, drops regional
tracks (region != "Global"), and writes a compact tracks.json the skill consumes.
"""
from __future__ import annotations

import html
import json
import re
import sys
import time
import urllib.request
from pathlib import Path

INDEX_URL = "https://superteam.fun/api/hackathon/frontier"
LISTING_URL = "https://superteam.fun/earn/listing/{slug}"
NEXT_DATA_RE = re.compile(
    r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>', re.S
)
TAG_RE = re.compile(r"<[^>]+>")
WS_RE = re.compile(r"[ \t]+")
NL_RE = re.compile(r"\n{3,}")

OUT_PATH = Path(__file__).resolve().parent.parent / "data" / "tracks.json"


def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": "colosseum-fit/1"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8")


def html_to_text(s: str) -> str:
    if not s:
        return ""
    s = re.sub(r"<br\s*/?>", "\n", s, flags=re.I)
    s = re.sub(r"</(p|h\d|li|div)>", "\n", s, flags=re.I)
    s = re.sub(r"<li[^>]*>", "- ", s, flags=re.I)
    s = TAG_RE.sub("", s)
    s = html.unescape(s)
    s = WS_RE.sub(" ", s)
    s = NL_RE.sub("\n\n", s)
    return s.strip()


def deep_find(obj, target_key):
    """Yield every value found under `target_key` anywhere in a nested obj."""
    if isinstance(obj, dict):
        for k, v in obj.items():
            if k == target_key:
                yield v
            yield from deep_find(v, target_key)
    elif isinstance(obj, list):
        for x in obj:
            yield from deep_find(x, target_key)


def find_listing_node(data):
    """Locate the bounty node — the dict that has both 'description' and 'region'."""
    stack = [data]
    while stack:
        cur = stack.pop()
        if isinstance(cur, dict):
            if "description" in cur and "region" in cur and "slug" in cur:
                return cur
            stack.extend(cur.values())
        elif isinstance(cur, list):
            stack.extend(cur)
    return None


def extract(slug: str) -> dict | None:
    raw = fetch(LISTING_URL.format(slug=slug))
    m = NEXT_DATA_RE.search(raw)
    if not m:
        return None
    data = json.loads(m.group(1))
    node = find_listing_node(data)
    if not node:
        return None
    skills_field = node.get("skills") or []
    skills_flat: list[str] = []
    if isinstance(skills_field, list):
        for s in skills_field:
            if isinstance(s, dict):
                if s.get("skills"):
                    skills_flat.append(s["skills"])
                for sub in s.get("subskills", []) or []:
                    if sub:
                        skills_flat.append(sub)
            elif isinstance(s, str):
                skills_flat.append(s)
    sponsor = node.get("sponsor") or {}
    return {
        "slug": slug,
        "title": node.get("title"),
        "region": node.get("region"),
        "reward": node.get("rewardAmount"),
        "token": node.get("token"),
        "deadline": node.get("deadline"),
        "sponsor": sponsor.get("name") if isinstance(sponsor, dict) else None,
        "skills": sorted(set(skills_flat)),
        "url": f"https://superteam.fun/earn/listing/{slug}",
        "description": html_to_text(node.get("description") or ""),
        "rewards_breakdown": node.get("rewards"),
    }


def main() -> int:
    print(f"Fetching index: {INDEX_URL}", file=sys.stderr)
    index = json.loads(fetch(INDEX_URL))
    print(f"  {len(index)} total tracks", file=sys.stderr)

    out: list[dict] = []
    skipped_regional: list[str] = []
    failed: list[str] = []

    for i, item in enumerate(index, 1):
        slug = item["slug"]
        print(f"  [{i}/{len(index)}] {slug}", file=sys.stderr)
        try:
            track = extract(slug)
        except Exception as e:
            print(f"    FAIL: {e}", file=sys.stderr)
            failed.append(slug)
            continue
        if not track:
            failed.append(slug)
            continue
        if (track.get("region") or "").lower() != "global":
            skipped_regional.append(f"{slug} ({track.get('region')})")
            continue
        out.append(track)
        time.sleep(0.25)

    out.sort(key=lambda t: (-int(t.get("reward") or 0), t["slug"]))

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(
        json.dumps(
            {
                "source": INDEX_URL,
                "fetched_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "kept": len(out),
                "skipped_regional": skipped_regional,
                "failed": failed,
                "tracks": out,
            },
            indent=2,
            ensure_ascii=False,
        )
    )
    print(
        f"\nKept {len(out)} | regional skipped {len(skipped_regional)} | failed {len(failed)}",
        file=sys.stderr,
    )
    print(f"Wrote {OUT_PATH}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
