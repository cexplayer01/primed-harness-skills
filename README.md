# primed-harness-skills

Skills and compatibility notes for **Primed Harness** (Bounded Agent
Harness) — the governed workspace for AI work.

Everything here is plain **SKILL.md**, the open agentskills.io
format. These skills load in Hermes Agent, Claude Code, Cursor, and
any other compatible client, and skills written for those tools load
in Primed Harness — import is verbatim, export is byte-identical,
and importing a skill never executes it.

Primed Harness is not another runtime. It's the seat around the run:
a budget approved before anything executes, an approval before
anything irreversible, and a receipt afterward — the run's record,
published, not promised. If you like the open agents' learning loop
but want a signature on what yours learns, that's the difference
this repo exists to serve.

## What's here

- **[`skillmd.mjs`](skillmd.mjs)** — the standalone SKILL.md checker
  and builder: the exact validation code Primed Harness runs in
  production, extracted dependency-free. Validate a skill on import,
  assemble one on export.
- **[`SPEC.md`](SPEC.md)** — the format rules as implemented:
  required and optional frontmatter, the name/description limits,
  and the superset posture (unknown fields preserved, never
  stripped).
- **[`examples/arxiv/`](examples/arxiv/)** — a real third-party
  skill from the Hermes ecosystem, included verbatim; it is the
  file that round-tripped Primed Harness on production
  byte-identical.

## Honest limits, printed like everything else here

Skills are shelved, validated, and portable; a skill you approve
can be attached to a pipeline run in Primed Harness (proven on
production, 8 November 2026 — the skill's text rides inside the
run's assembled context, shown to you before the run starts). The
shelf is per-browser while you're a guest, and follows your account
when you sign in. Primed Harness itself is a hosted product, not
open source — what's open is this repo: the skills, the adapter,
and the spec notes. The proof record for every claim above is at
boundedagentharness.com/proof.
