# Agora Conversational AI Next.js Quickstart — Repo Card

> Official Next.js quickstart for building browser-based voice AI agents with Agora Conversational AI Engine.

## Identity

| Field | Value |
| --- | --- |
| Repo | `AgoraIO-Conversational-AI/agent-quickstart-nextjs` |
| Type | `frontend-app` |
| Language | TypeScript, Next.js 16 App Router, React 19 |
| Deploy Target | Local Node.js dev server, Vercel |
| Owner | Agora Conversational AI / DevEx |
| Recipe Role | base |
| Recipe Version | 0.1.0 |
| Recipe Status | stable |
| Last Reviewed | 2026-11-21 |

## L1 — Summaries

Review scope on 2026-11-21 includes the animation playground, local video/WebP workflow, and profile avatars driven by RTC speech activity. Profiles explicitly request local avatars without Lemon Slice; omitted invite avatar mode preserves provider defaults.

The bundled assets are `lummi-transparente.webp` for speaking and `lummi-transparente-02.webp` for listening (each 192 frames, alpha, approximately 8 seconds), rendered by a shared WebP component in both profiles and the playground. Profiles preload both clips and animate only the active speech state; silence remains still. The earlier MP4 is not the default.

The reviewed avatar loading flow shares bundled downloads across placeholder/live remounts, exposes failed-load recovery, and retains explicit motion choices per tab. LAN previews require a network binding; microphone use on another device requires HTTPS.

The profile's visual state gives audible agent speech priority over microphone activity; listening resumes after agent speech ends if the user is still talking. RTC voice interruption behavior is unchanged.

The Audience column helps agents prioritise: **Use** = consuming the repo behavior, **Maintain** = changing internals.

| File | Purpose | Audience |
| --- | --- | --- |
| [01_setup](L1/01_setup.md) | Environment setup, quick commands, env vars, verification safety | Use & Maintain |
| [02_architecture](L1/02_architecture.md) | End-to-end runtime architecture and data flow | Maintain |
| [03_code_map](L1/03_code_map.md) | Directory/module map and ownership boundaries | Maintain |
| [04_conventions](L1/04_conventions.md) | Coding conventions, lifecycle patterns, and doc sync rules | Maintain |
| [05_workflows](L1/05_workflows.md) | Common task recipes (run, modify, validate, ship) | Use & Maintain |
| [06_interfaces](L1/06_interfaces.md) | API contracts, event payloads, env contracts | Use & Maintain |
| [07_gotchas](L1/07_gotchas.md) | High-impact pitfalls and known failure modes | Maintain |
| [08_security](L1/08_security.md) | Secret handling, trust boundaries, auth/token model | Maintain |
