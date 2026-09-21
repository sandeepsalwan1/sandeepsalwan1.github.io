---
title: "My Prompts: Codebase Orientation and a FirstMate Build Log"
description: The two prompts I reuse most. One makes an AI explain any codebase so I can explain it back. The other is the exact sequence of prompts that took an iOS app from idea to backend review.
slug: my-prompts-codebase-orientation-and-a-firstmate-build-log
canonical_url: https://sandeeps.tech/blog/my-prompts-codebase-orientation-and-a-firstmate-build-log/
tags:
  - ai
  - prompts
  - agents
  - productivity
cover_url: ""
publish_devto: false
publish_medium: false
publish_hashnode: false
hashnode_publication_id: USE_DEFAULT
---

I keep two prompts in a text file and paste them constantly. This post is that file, cleaned up so you can copy it.

1. **Codebase orientation.** Paste it into any coding agent on a repo you have never seen. It forces the agent to explain the system the way a good senior engineer would explain it to a new hire.
2. **A FirstMate build log.** The exact, in-order prompts I gave an orchestrator agent to take a kids' iOS app from "does this exist?" to a backend architecture review. Read it as a template for driving agents end to end.

## Prompt 1: Codebase orientation

Paste this as the first message in a new session on an unfamiliar repo. The rules at the top are what make it work: high level first, every term defined before use, data flow from input to output, and no code-level detail until you ask for it.

```text
Explain this codebase. Automatically do codebase orientation and scan this codebase. Have a low Flesch-Kincaid score. I am action focused, e.g. focused on getting info that would help me take actions.

Remember you can expand for explanation. Make sure I completely understand. Make sure I'd be able to explain it to an interviewer or someone else. That's the number one priority. This is your main goal: I understand. Try not to reference specific things, because we do not need to know every single interface, every single function, every single thing. The most important thing is the big picture right now. Write for an engineer who has never worked on this kind of production infrastructure. Every term is defined before it is used. Write to be readable.

There are two kinds of phases:
- High-level design
- Low-level design

Most of it right now should be high-level design. Most of it should be black boxes to me. Do not reference specific code functions, interfaces, etc., because I don't have any understanding of that yet. We can go low-level on a specific area later as needed.

<important>
Explain how data flows from input to output.
Explain the relevant API design.
</important>

You are a rigorous and clear coder in the format below. Your goal is to help me pass technical interviews. For explanations: give good explanations, don't use artifacts, and make sure your dry run is correct. Be clear and follow these instructions thoroughly.

General concepts: Start with the direct answer immediately, then elaborate. Always provide a clear example.

When I ask you to explain a concept:
- Direct answer: start with the direct, core explanation immediately.
- Example: always provide a clear example. I will use this example to talk to an interviewer, so make it clear.

Re-explain: if I say I'm confused, re-explain from scratch. Reprint the code with comments. Trace the actual execution line by line using a concrete example. Show what every variable equals at each step. Don't explain the abstract idea; walk through the literal variable values. Explain any confusing parts (why two cases, why +1, why a certain condition) in plain English. Goal: after reading your response I have zero remaining questions. You should have done that for me in the first response anyway.

Codebase orientation:
Automatically do codebase orientation. This is always the first thing that happens.
The goal: give me the map of this codebase so I completely understand it and can solve many questions. Keep it useful. Do not list bugs, do not figure out test answers, do not explain implementation details. I'll ask for those.

What to cover:
1. What does this system do? What problem is being solved? What's the input and output?
2. Every class/file and what it does, plus the important functions (not trivial getters). Give me class names, key method names, key fields: the names I need to reference in my prompts. Do not mention types or return types; I can read the signatures myself. Do not explain how methods work in depth. Bad example (do not do this): valid_words() -> List[str], are_compatible(word_a, word_b) -> bool. Instead give the class, then the key functions in it.
3. How it connects. What calls what? What's the architecture (modular, MVC, flat, etc.)? One or two sentences. Where does state live?
4. Tests. For each test (including commented-out ones): what's the input, what's the expected output, and why. Trace through the logic briefly like a dry run so I actually understand what the code is supposed to do. If expected values are unknown, still explain the input and what the test is checking.
5. Anything non-obvious: performance constraints, gotchas, weird patterns. Only if actually relevant. Skip entirely if nothing is surprising.

Include the main functionality, key components, how they interact, and the overall purpose of the application.

If I ask for orientation again, it means I didn't understand it the first time. Re-explain from scratch, clearer. But the goal is to explain it clearly enough the first time that I never need to ask again.

<personal context>
I'm a new SDE 1. A problem I have is I don't go deep enough. I want you to teach me what I need to know. When relevant, explain like I'm an 8th grader, or like I need to explain it to my manager or teammates. Decide which, but make sure I understand. Be concise because I have to move fast. Use logical, evidence-based thinking. I like direct actions and crisp explanations. I'm strong in Python at the algorithms level (500+ LeetCode) but I don't know production libraries, so keep analogies to basics like loops and data structures, and don't over-reference that. Make sure I have no follow-up questions because you explained everything clearly. Use this context to give me perfect explanations in this chat.
</personal context>
```

Why this shape works:

- **"Low Flesch-Kincaid score" and "every term defined before use"** stop the agent from hiding behind jargon.
- **"Black boxes" and "no function names"** keep the first pass at the architecture level. You get the map before the streets.
- **"Data flow from input to output" and "API design"** are the two things an interviewer actually asks about.
- **"Walk through the tests as a dry run"** is the fastest way to learn what a system is supposed to do. Tests are executable specs.
- **The personal context block** is the part people skip. It is what turns a generic answer into one tuned to you.

## Prompt 2: A FirstMate build log

FirstMate is an orchestrator agent. You talk to it; it dispatches work to worker agents ("crewmates") in parallel and reports back. Below are the prompts I gave it, in order, to build a kids' iOS app with a private backend. I have fixed the voice-transcription typos but kept the wording. Notice the pattern: set ground rules first, run research in parallel, prototype before building, move to a repo and PR workflow, then split frontend and backend.

### Setup and ground rules

> Hey FirstMate, let's set up a new project here. Just a local repo for now. Put a dummy README file in it and make a commit to get it started. And I want to lay down a ground rule: today, every task, every crewmate will be dispatched to a Pi agent running GPT 5.6 at x-high reasoning level. Get that set up as well.

### Two research tracks in parallel

> Market research to see whether such an app already exists, because if it already exists that changes things. That's it for the market research. The other thing I want to do in parallel is look into the technical aspect: how would we approach building this full stack, end to end? Kick off those two things in parallel.

> Use Lavish for the technical research. Come back with a technical proposal in Lavish with all the open questions and decisions I have to make laid out.

> FirstMate, while we wait for those investigations, go back to the market research. Analyze it and figure out what interesting concepts the other products have that we should draw inspiration from and consider in our product.

> Revise this artifact based on this feedback.

### Prototypes you can click

> Hey FirstMate. The UX prototypes crewmate has done its work but only wrote the results in a markdown file. That's a scope definition for the prototypes, not real prototypes. Ask for real prototypes I can play with in an HTML artifact in Lavish. It should be possible without building any real code. I just want an HTML prototype.

> I want to make some improvements. The snowy mountains don't look as good as they could. Prototype a few really good-looking mountains we can render. Also prototype a few different kinds of birds. Give me three variants of each so I can choose. Each idea should be done by a crewmate in parallel. Once the prototypes are ready, give them to me in Lavish to review.

> Focus on wireframes: just the screens, the concepts, the user flow. Not polished UX mocks.

### From artifact to PRD to GitHub

> Don't make this artifact again. Instead, take the feedback into account and write a PRD as a markdown file in the repo. Probably as the README for now.

> Ask the worker to commit the update into the repo, then publish this repo to my GitHub as a public repo. Use my GitHub account; my local GitHub CLI is already authenticated.

> Now that we have the GitHub repo, switch to a PR-based workflow. We don't need the strict guardrail right now; this is still a very early product. Every PR, once you've reviewed it, is okay to merge. You don't need my approval. We'll add a stronger approval flow once we have an MVP.

### Start building

> This repo doesn't have any source code yet. This is going to be an iOS app. Read the README to understand the requirements. Figure out the main screens, and feel free to challenge any prescribed user experience in there. Use your judgment for the best experience. I want it fun, educational, and friendly for kids, and for parents I want good control and transparency.

> I'm asking a designer to look at the UI. In the meantime, spin up the backend. What do we need to set up? If anything needs me (for example, Apple Sign In), let me know, but keep going on everything that isn't blocked on me. Parallelize as much as possible. I have an API token in my vault you can use to manage my Hetzner account.

> Use OpenTofu for infrastructure where appropriate.

> Share a zip archive of the HTML prototype project.

### Design system arrives

> Our design team has come back with a full design system and mocks. Follow that to build the iOS app now. The design system is at ~/Downloads/eddies-wallet-design. Copy it into our repo, set it up, and follow it to build the actual UI. It should be an iOS app that runs on both iPhone and iPad.

> The backend needs to be a private repo. Only the frontend, the iOS app, goes in the open-source repo.

> Use the Cloudflare token for domains.

### Review before going further

> In the meantime, let's do a backend architecture review. I want to focus on what API endpoints are exposed, how we handle authentication, and what DB schema we created. Those are the things I'm most interested in. Review it in Lavish.

## What I would tell someone copying this

- **Ground rules go first.** Model, reasoning level, repo, and commit habits. Set them once so every crewmate inherits them.
- **Parallel by default.** Market research and technical research have no dependency on each other. Run them together.
- **Prototype in HTML before writing app code.** It costs minutes and kills bad ideas early.
- **Write the PRD into the repo.** The README is the spec. Agents read it on every task.
- **Loosen guardrails early, tighten later.** Auto-merge PRs until MVP, then add approval.
- **Review the three things that are hard to change:** endpoints, auth, schema.
