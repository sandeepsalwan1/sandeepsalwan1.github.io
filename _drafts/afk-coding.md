---
title: "AFK Coding: The Small Stack I Trust to Keep Working"
description: "How I combine clear prompts, GitHub Actions, Crabbox, no-mistakes, focused Codex skills, browser automation, and a quiet Mac setup for reliable AFK coding."
slug: afk-coding
canonical_url: "https://sandeeps.tech/blog/afk-coding/"
tags:
  - AI agents
  - coding agents
  - developer tools
  - automation
cover_url: ""
publish_devto: true
publish_medium: false
publish_hashnode: true
hashnode_publication_id: USE_DEFAULT
---

<!-- DRAFT WORKPAD
Before publishing:
- Link the GitHub Actions template repository after it is public.
- Confirm which Lux project should be named alongside shadcn/ui.
- Add a successful workflow image only after confirming that the image and destination are safe to publish.
- Read aloud once and cut anything that sounds like a tool inventory.
END DRAFT WORKPAD -->

The best version of AI-assisted coding is not watching an agent type faster.
It is giving the agent a bounded job, leaving, and returning to a result that has already been checked.

That is what I mean by AFK coding.
AFK does not mean unsupervised access to everything.
It means the system can make useful progress without requiring me to approve every command or stare at every token.

The difference is mostly engineering.
A good unattended loop needs a clear unit of work, a small toolset, a repeatable environment, independent verification, and a stop condition.
Without those pieces, autonomy just produces uncertainty faster.

## The loop

My default loop is deliberately boring:

1. An issue describes one result, its boundaries, and the proof required.
2. A coding agent implements the smallest complete change.
3. Local checks catch cheap failures immediately.
4. GitHub Actions rebuilds the project from a clean checkout.
5. Remote validation checks the behavior in the environment that matters.
6. A review pass looks for what the implementation and tests both missed.
7. The change stops for a human when risk, ambiguity, or missing access crosses a clear boundary.

The goal is not to remove judgment.
The goal is to spend judgment on product decisions instead of repetitive coordination.

I have been applying this pattern while building [Vet](https://github.com/sandeepsalwan1/Vet), where the useful unit is not "let an agent work."
It is "take one well-scoped issue through implementation, proof, review, and a merge-ready result."

## The prompt is part of the control plane

The prompt does not need to explain every implementation detail.
It needs to make the result, repository context, proof, and boundaries hard to misunderstand.

My useful prompts usually have five parts:

1. **Outcome:** what should be true for the user when the work is complete.
2. **Repository context:** the relevant plan, documentation, files, current behavior, and commands.
3. **Acceptance criteria:** observable requirements, written as a checklist.
4. **Proof:** the strongest evidence the result needs, such as tests, a real browser interaction, a GIF, or deployed-service health.
5. **Constraints:** scope limits, compatibility contracts, security boundaries, and conditions that should stop the run.

Here is the small template I reach for:

```text
Outcome
A user can <do the thing> and observe <the result>.

Repository context
- Read the repository instructions first.
- Relevant plan or files: <paths or links>.
- Current behavior: <what happens now>.

Acceptance criteria
- [ ] The requested behavior works through the real user path.
- [ ] Regression coverage passes.
- [ ] User-facing documentation is current.

Proof
- Run <exact checks>.
- For UI work, use <route and interaction> and capture the visible result.

Constraints
- Preserve <named behavior or data contract>.
- Do not publish secrets or private material.
- Stop with one actionable blocker if required access or proof is unavailable.
```

This is also how I explain a repository to an agent.
I point it to the durable map and commands instead of pasting the entire codebase into every task.
The prompt says what to read, what outcome matters, what evidence counts, and where autonomy ends.

The important trick is making proof part of the request before implementation starts.
"The tests pass" may be enough for a parser.
It is not enough for a visual interaction that can be technically present and still unusable.

## A reusable GitHub Actions starting point

I am turning the common parts of that loop into a GitHub Actions template.
The template combines two tools with different jobs:

- [no-mistakes](https://github.com/kunchenguid/no-mistakes) runs the quality gate: review, tests, lint, documentation checks, and CI.
- [Crabbox](https://github.com/openclaw/crabbox) provides clean remote machines for behavior checks on the operating systems a change actually targets.

They are complementary.
A quality gate can prove the repository is internally consistent.
A clean remote environment can prove the result is not surviving only because of state on my laptop.

The template is meant to stay small.
It should define:

- one issue or task as the input;
- the allowed validation targets;
- the exact commands that count as proof;
- a bounded retry policy;
- an artifact or transcript that a person can inspect;
- a hard stop for missing credentials, unclear intent, or destructive work.

The most important property is failure behavior.
If a browser cannot attach, a secret is unavailable, or the requested proof cannot run, the workflow should report one actionable blocker.
It should not quietly substitute a weaker test and call the task complete.

## Codex skills: less is better

I used to think a capable agent should have every possible tool loaded.
In practice, a large ambient tool belt creates more routing choices, more prompt overhead, and more ways to reach for the wrong abstraction.

My personal setup keeps a small core and loads specialized skills only when the task calls for them.
The recurring set is roughly:

- a quality gate for finishing work;
- Crabbox for clean-machine validation;
- GitHub operations;
- browser or desktop control;
- UI primitives and design guidance;
- source inspection for dependencies.

Everything else earns its place through repeated use.

This makes skill design important.
A useful skill is not a giant encyclopedia.
It is a compact operating contract that tells the agent when to use a tool, what safe behavior looks like, and what evidence counts as success.

I keep the same small skills available in my personal Codex setup and in Crabbox.
That consistency matters more than a huge catalog.
An agent that sees the same commands, boundaries, and proof rules locally and remotely is easier to trust.

## The visual layer: shadcn/ui, then taste

For web interfaces, [shadcn/ui](https://ui.shadcn.com/) is a strong starting point because the components become part of the codebase.
The agent can inspect and adapt them instead of treating a component package as a black box.

The components are not the design.
They remove low-value plumbing so more attention can go to hierarchy, spacing, writing, responsive behavior, and the uncomfortable details that make an interface feel intentional.

My rule is simple: use the primitive, then inspect the actual screen.
A technically correct interface can still have weak contrast, awkward rhythm, generic cards, or a mobile layout that feels accidental.
The UI needs a visual pass, not just a type-check.

## Seeing the real computer

Browser tests cover a lot, but some products cross browser, desktop, and operating-system boundaries.
For those jobs I use [Peekaboo](https://github.com/steipete/Peekaboo), Peter Steinberger's macOS automation toolkit.
It can inspect the screen and accessibility tree, then drive real interface actions.

[Chrome DevTools MCP](https://github.com/ChromeDevTools/chrome-devtools-mcp) is another good option when the task stays inside Chrome.
It provides a narrower browser surface and excellent page-level inspection.
I reach for Peekaboo more often because many of my workflows eventually touch a native prompt, another app, or system UI.

The distinction matters.
Source code can say a button exists.
A DOM check can say it is rendered.
A real interaction can say a person can actually use it.

## Reading dependencies instead of guessing

Documentation tells me how a library is supposed to work.
The installed source tells me what this version actually does.

[opensrc](https://github.com/vercel-labs/opensrc) makes dependency source easy to inspect.
I use it when an agent needs to understand an undocumented behavior, trace a wrapper, or confirm whether a proposed integration matches the code we are shipping.

This is one of the highest-leverage habits in agent work.
When source is available, guessing about a library's internals is unnecessary risk.

## The always-on layer

My coding workflow is only one part of the system.
For the always-on assistant layer, I use [Hermes Agent](https://github.com/NousResearch/hermes-agent) as the entry point and [Honcho](https://github.com/plastic-labs/honcho) for durable memory.

I keep that layer separate from repository CI.
Hermes can hold conversational context and route personal tasks.
Honcho helps useful context survive across sessions.
Calling is exposed as a narrow capability for explicit, approved tasks rather than a general permission to contact people.

That separation keeps the mental model clean:

- GitHub owns repository state and repeatable automation.
- Crabbox owns disposable validation environments.
- Hermes owns the ongoing assistant interaction.
- Honcho owns durable personal context.
- A human owns consequential decisions.

The tools can cooperate without becoming one giant agent with unlimited authority.

## My Mac is part of the interface

AFK coding still starts and ends at a desk, so I treat my Mac setup as part of the product.

My wallpaper acts as a quiet visual anchor rather than decoration.
It keeps the current focus visible without adding another window.

A small Chrome extension blocks the routes that reliably turn a quick check into an hour of scrolling.
The useful design choice is route-level control.
I can keep a site available for intentional work while removing the specific feeds that consume attention.

The rest of the productivity setup follows the same principle:

- fewer persistent notifications;
- fewer tools visible by default;
- one obvious place for the current task;
- automation that reports exceptions instead of demanding constant observation;
- easy ways to inspect what happened while I was away.

Productivity, for me, is not fitting more activity into the day.
It is reducing the number of times valuable attention gets broken into tiny pieces.

## What I am optimizing for

AFK coding is successful when I can return and answer five questions quickly:

1. What changed?
2. Why did it change?
3. What independently verified it?
4. What remains uncertain?
5. Can I safely merge, retry, or stop?

If the system cannot answer those questions, more autonomy will not fix it.
Better boundaries and better evidence will.

The stack will keep changing.
The shape of the system probably will not: small skills, clean environments, explicit gates, real behavior checks, durable context, and a human decision at the edge.

That is the version of AFK coding I want.
Not code generated while I am gone, but trustworthy progress waiting when I come back.
