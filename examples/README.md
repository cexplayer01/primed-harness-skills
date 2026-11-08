# Examples

## arxiv/ — a real third-party skill, verbatim

`arxiv/SKILL.md` is the `arxiv` skill from the Hermes Agent ecosystem
([NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent),
MIT licensed; the file's own frontmatter carries `license: MIT` and
`author: Hermes Agent`). It is included **exactly as its authors wrote
it** — Hermes superset fields (`version`, `platforms`,
`metadata.hermes.*`) and all — because that is the point of the
example:

On 8 November 2026 this file was imported into Primed Harness on
production (boundedagentharness.com/library), shelved, and downloaded
back **byte-identical** — frontmatter, superset fields, and body. It
is the round-trip proof referenced in [`../SPEC.md`](../SPEC.md), and
it validates clean with [`../skillmd.mjs`](../skillmd.mjs):

```
node -e "import('./skillmd.mjs').then(async m => { const fs = await import('node:fs'); console.log(m.parseSkillMd(fs.readFileSync('examples/arxiv/SKILL.md','utf8')).ok) })"
```
