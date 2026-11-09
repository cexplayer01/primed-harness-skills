---
name: primed-harness
description: Connect an agent to Primed Harness (Bounded Agent Harness) — governed workspaces, multi-model review and split runs, owner-approved memory, and research packs over the live MCP server at boundedagentharness.com/mcp. Use when work needs budgets, approvals, and an audit trail instead of a bare chat.
---

# Primed Harness

Primed Harness is a governed agent harness: bounded budgets, least-disclosure
handoffs, owner-approved memory, and a hash-chained record of what ran.

## Connect

Add the remote MCP server to your client:

- URL: `https://boundedagentharness.com/mcp`
- Transport: Streamable HTTP
- Public tools (no token): `bah_about` plus the five research-run tools.
- Workspace tools: mint a personal access token in the web workspace
  (boundedagentharness.com → Workspace → Tokens) and send it as a bearer
  token. Tools include workspace pads, reviews, split runs, inbox,
  handoffs, governed memory, and the registry preflight/permission checks.

## Rules of the road

- Nothing spends without a contract: runs land as drafts with an estimate
  and a hard cap, and proceed only on approval.
- Memory is proposed, never silently written: agent-suggested memory lands
  as a draft a human confirms.
- Verify at the layer where behavior lives: check job status with the
  status tools before reporting an outcome.
