#!/usr/bin/env python3
"""Migrate issues from worldapp-forge-legacy → worldapp-forge with preserved metadata."""
import json
import subprocess
import sys
import time

LEGACY = "bottxrnife/worldapp-forge-legacy"
TARGET = "bottxrnife/worldapp-forge"


def gh(*args: str):
    r = subprocess.run(["gh", "api", *args], capture_output=True, text=True, check=True)
    return json.loads(r.stdout) if r.stdout.strip() else {}


def gh_cmd(*args: str) -> str:
    r = subprocess.run(["gh", *args], capture_output=True, text=True, check=True)
    return r.stdout.strip()


def footer(issue: dict) -> str:
    n = issue["number"]
    created = issue["created_at"]
    author = issue["user"]["login"]
    closed = issue.get("closed_at")
    lines = [
        "",
        "---",
        f"**Migrated from [{LEGACY}#{n}](https://github.com/{LEGACY}/issues/{n})**",
        f"- **Originally opened:** {created} by @{author}",
    ]
    if closed:
        lines.append(f"- **Originally closed:** {closed}")
    lines.append(
        "\n> GitHub does not allow backdating issue timestamps via the API; "
        "the dates above reflect the original legacy repo."
    )
    return "\n".join(lines)


def main() -> None:
    existing = gh_cmd("issue", "list", "--repo", TARGET, "--state", "all", "--limit", "100")
    if existing.strip():
        print("Target repo already has issues — aborting to avoid duplicates.", file=sys.stderr)
        print(existing, file=sys.stderr)
        sys.exit(1)

    issues = []
    for n in range(1, 17):
        issue = gh(f"repos/{LEGACY}/issues/{n}")
        comments = gh(f"repos/{LEGACY}/issues/{n}/comments")
        issues.append((issue, comments))

    issues.sort(key=lambda x: x[0]["created_at"])

    mapping: dict[int, int] = {}
    for issue, comments in issues:
        body = (issue.get("body") or "").strip()
        body = (body + footer(issue)).strip()
        title = issue["title"]
        print(f"Creating: #{issue['number']} {title[:60]}…")
        out = gh_cmd(
            "issue", "create",
            "--repo", TARGET,
            "--title", title,
            "--body", body,
        )
        # "https://github.com/bottxrnife/worldapp-forge/issues/3"
        new_num = int(out.rstrip("/").split("/")[-1])
        mapping[issue["number"]] = new_num

        for c in comments:
            cbody = (c.get("body") or "").strip()
            cbody += f"\n\n_Originally posted {c['created_at']} by @{c['user']['login']} on legacy #{issue['number']}._"
            gh_cmd(
                "issue", "comment", str(new_num),
                "--repo", TARGET,
                "--body", cbody,
            )

        if issue["state"] == "closed":
            gh_cmd("issue", "close", str(new_num), "--repo", TARGET, "--comment",
                   f"Closed — resolved on `main` (migrated from legacy #{issue['number']}, originally closed {issue.get('closed_at', 'n/a')}).")

        time.sleep(0.4)

    print("\nMigration complete:")
    for old, new in sorted(mapping.items()):
        print(f"  legacy #{old} → {TARGET}#{new}")


if __name__ == "__main__":
    main()
