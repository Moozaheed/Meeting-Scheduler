# Environment Provisioning — Clarifying Questions

This stage's standard AWS-oriented questions (VPCs, subnets, Secrets
Manager, cross-account connectivity) are not applicable — this project has
zero AWS resources, zero IaC tool, and zero runtime secrets
(`infrastructure-specification.md`'s Q1 decision; `security-design.md`).
The one adapted, genuinely open item is below.

## Q1 — Vercel project setup: who performs it, and when

Since there is no IaC tool (`infrastructure-specification.md`'s Q1), the
single Vercel project and its git-linked settings must be configured once,
manually, through the Vercel dashboard/CLI — this workflow itself has no
credentials to do that. Should this stage document the exact manual setup
steps as a checklist for the human to perform themselves (once, outside
this session), or is there an existing Vercel project already provisioned
for this repository that this stage should instead just validate against?

[Answer]: Document a manual setup checklist — no Vercel project exists yet for this repo; write the exact steps as a checklist to perform once, outside this session.
