# The SKILL.md format, as Primed Harness implements it

A skill is a Markdown file with a YAML frontmatter block. This is the
[agentskills.io](https://agentskills.io) format — the same SKILL.md
shape used by Hermes Agent and a growing list of other tools. This
page records the rules exactly as the production checker in
[`skillmd.mjs`](skillmd.mjs) enforces them.

## Required frontmatter

| Field | Rule |
|---|---|
| `name` | 1–64 characters; lowercase letters, digits, and single hyphens (`^[a-z0-9]+(-[a-z0-9]+)*$`) — no leading, trailing, or consecutive hyphens |
| `description` | 1–1024 characters; says what the skill does and when to use it |

## Optional frontmatter

| Field | Rule |
|---|---|
| `license` | License name or reference |
| `compatibility` | ≤ 500 characters |
| `metadata` | String map; nested maps are preserved |
| `allowed-tools` | Tool list, space-separated |

Any other fields a tool adds are **extras**. Hermes Agent, for
example, writes a superset (`version`, `author`, `platforms`,
`metadata.hermes.*`, …). Extras are never stripped: an imported skill
is stored **verbatim**, so what another tool wrote is what you get
back on export, byte for byte.

The body — everything after the closing `---` — is the instructions,
and must be non-empty.

## Posture

- **Import leniently.** Unknown fields, nested metadata, and block
  scalars are preserved. A file that fails a rule is refused with the
  failed checks named in plain language, and nothing is stored.
- **Export strictly.** Anything assembled by `buildSkillMd` /
  `padToSkillMd` passes the checker by construction.
- **Importing never executes anything.** A skill on the shelf is inert
  text until a person deliberately uses it.

## Provenance

These rules were surveyed from the agentskills.io specification and
the Hermes Agent skill corpus on 8 November 2026, and are verified in
production at boundedagentharness.com/library: a real third-party
skill from the Hermes ecosystem (the `arxiv` skill in
[`examples/`](examples/)) imports, shelves, and downloads back
**byte-identical**.
