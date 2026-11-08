/* skillmd.mjs — validate and assemble SKILL.md files (agentskills.io format).
 *
 * This is the standalone form of the exact code Primed Harness
 * (boundedagentharness.com) runs in production to check skills on
 * import and to build them on export — extracted from the production
 * source (app/easy-tools.tsx, functions parseSkillMd / buildSkillMd /
 * slugifySkillName / padToSkillMd) with only the TypeScript types
 * removed. Same rules, same refusal messages, no dependencies.
 *
 * Posture, same as in the product: import leniently (unknown
 * frontmatter fields are preserved, never stripped), export strictly
 * (what we emit always passes the checker), and importing a skill
 * never executes anything — a skill is text until a person uses it.
 *
 * MIT licensed — see LICENSE. */

const SKILL_NAME_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function unquoteSkillValue(v) {
  const t = v.trim();
  if (t.length >= 2 && ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'")))) {
    return t.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, "\\");
  }
  return t;
}

/* Parse and validate a SKILL.md document.
 * Returns { ok, checks: [{label, ok, detail?}], meta?, body }.
 * `ok` is true only when every check passes. Nothing is mutated:
 * callers store the original source verbatim. */
export function parseSkillMd(source) {
  const checks = [];
  const src = source.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
  const lines = src.split("\n");
  let i = 0;
  while (i < lines.length && lines[i].trim() === "") i++;
  const hasOpen = i < lines.length && lines[i].trim() === "---";
  checks.push({ label: "Frontmatter block (--- … ---) at the top", ok: hasOpen, detail: hasOpen ? undefined : "A SKILL.md starts with a --- line, frontmatter, then a second --- line." });
  if (!hasOpen) return { ok: false, checks, body: "" };
  i++;
  const fmStart = i;
  while (i < lines.length && lines[i].trim() !== "---") i++;
  const hasClose = i < lines.length;
  checks[0] = { label: "Frontmatter block (--- … ---) at the top", ok: hasClose, detail: hasClose ? undefined : "The closing --- line is missing." };
  if (!hasClose) return { ok: false, checks, body: "" };
  const fmLines = lines.slice(fmStart, i);
  const body = lines.slice(i + 1).join("\n");

  // Closed line-based parse of the flat frontmatter: top-level
  // `key: value` lines; indented lines belong to the key above them
  // (a nested map like `metadata:`, or a > / | block scalar).
  const fields = {};
  let parseError = "";
  let curKey = "";
  let blockMode = "";
  for (const raw of fmLines) {
    if (raw.trim() === "") continue;
    const indented = /^\s/.test(raw);
    if (!indented) {
      const m = raw.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
      if (!m) { parseError = `Could not read this frontmatter line: "${raw.trim().slice(0, 60)}"`; break; }
      curKey = m[1].toLowerCase();
      const v = m[2].trim();
      if (v === ">" || v === ">-" || v === "|" || v === "|-") { blockMode = v.startsWith(">") ? "fold" : "literal"; fields[curKey] = ""; }
      else { blockMode = ""; fields[curKey] = unquoteSkillValue(v); }
    } else if (curKey) {
      const t = raw.trim();
      if (blockMode === "fold") fields[curKey] = (fields[curKey] + " " + t).trim();
      else if (blockMode === "literal") fields[curKey] = (fields[curKey] ? fields[curKey] + "\n" : "") + t;
      else if (!fields[curKey]) fields[curKey] = t; // first line of a nested map (e.g. metadata:) — kept as a note; the verbatim text is what's stored
    }
  }
  if (parseError) {
    checks.push({ label: "Frontmatter can be read", ok: false, detail: parseError });
    return { ok: false, checks, body };
  }
  checks.push({ label: "Frontmatter can be read", ok: true });

  const name = (fields["name"] || "").trim();
  checks.push({ label: "name is present", ok: name.length > 0, detail: name ? undefined : "The frontmatter needs a name: line." });
  const nameOk = name.length >= 1 && name.length <= 64 && SKILL_NAME_RE.test(name);
  checks.push({
    label: "name is a valid skill name (1-64 chars, lowercase letters, digits, single hyphens)",
    ok: nameOk,
    detail: nameOk ? undefined : `"${name.slice(0, 40)}" breaks the rule — lowercase letters, digits and single hyphens only, no leading/trailing hyphen.`,
  });
  const description = (fields["description"] || "").trim();
  checks.push({ label: "description is present", ok: description.length > 0, detail: description ? undefined : "The frontmatter needs a description: line saying what the skill does and when to use it." });
  checks.push({
    label: "description fits 1-1024 characters",
    ok: description.length >= 1 && description.length <= 1024,
    detail: description.length > 1024 ? `It is ${description.length} characters — the format caps it at 1024.` : undefined,
  });
  const compatibility = (fields["compatibility"] || "").trim();
  if (compatibility) {
    checks.push({ label: "compatibility fits 500 characters", ok: compatibility.length <= 500, detail: compatibility.length > 500 ? `It is ${compatibility.length} characters — the format caps it at 500.` : undefined });
  }
  const bodyOk = body.trim().length > 0;
  checks.push({ label: "Instructions (the text after the frontmatter) are non-empty", ok: bodyOk, detail: bodyOk ? undefined : "A skill with no instructions has nothing to use." });

  const known = new Set(["name", "description", "license", "compatibility", "allowed-tools"]);
  const extra = {};
  for (const [k, v] of Object.entries(fields)) if (!known.has(k) && v) extra[k] = v;
  const meta = {
    name, description, extra,
    license: fields["license"]?.trim() || undefined,
    compatibility: compatibility || undefined,
    allowedTools: fields["allowed-tools"]?.trim() || undefined,
  };
  return { ok: checks.every(c => c.ok), checks, meta, body };
}

/* Slugify a title into a valid skill name. */
export function slugifySkillName(title) {
  const s = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 64).replace(/-+$/g, "");
  return s || "my-skill";
}

function skillYamlQuote(v) {
  return '"' + v.replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';
}

/* Assemble a SKILL.md from explicit parts (name must already be a
 * valid slug — see slugifySkillName; description is quoted safely). */
export function buildSkillMd(name, description, bodyText) {
  return `---\nname: ${name}\ndescription: ${skillYamlQuote(description)}\n---\n\n${bodyText.trim()}\n`;
}

/* Turn an arbitrary document into a valid SKILL.md. The name and
 * description are DERIVED (slugified title; first meaningful line for
 * the description) — show both to the user before use, because
 * generated fields are not authored fields. */
export function padToSkillMd(title, text) {
  const name = slugifySkillName(title);
  let description = "";
  for (const raw of text.split("\n")) {
    const line = raw.replace(/^#+\s*/, "").replace(/^(GOAL|Goal):\s*/, "").trim();
    if (line.length >= 12) { description = line; break; }
    if (!description && line) description = line;
  }
  if (!description) description = `Exported from Primed Harness: ${title}`;
  if (description.length > 200) description = description.slice(0, 197).replace(/\s+\S*$/, "") + "…";
  const md = buildSkillMd(name, description, text);
  return { name, description, md };
}
