# Practices Discovery — Interview

This is greenfield — there's no existing code to read your habits from, so the questions below turn the standing org-wide defaults (and a few things the reviewing specialists flagged) into choices for you to confirm, adjust, or reject.

## Q1. Branching and merging: short-lived feature branches straight into `main`, squashed into one clean commit each?
This avoids long-lived branches piling up merge conflicts, and keeps `main`'s history simple — one commit per finished piece of work.

- A. Yes, that's fine as-is
- B. Something different (please specify)
- X. Other (please specify)

[Answer]: A. Yes, that's fine as-is

## Q2. Build a thin end-to-end slice first? A walking skeleton is a minimal version that runs the whole way through, built first to prove the pieces connect before the real features go in.
This workflow's setup already says to skip that step and just build the first real piece of work like any other. Confirm that's right for a solo project like this?

- A. Yes, skip it — build normally from the start
- B. Actually, I do want a thin end-to-end slice first
- X. Other (please specify)

[Answer]: A. Yes, skip it — build normally from the start

## Q3. What testing style and toolset should this project use?
Given the risky part is the invitation-card PDF/QR export working correctly across browsers, the specialists reviewing this recommend writing code first and adding tests right after each piece (rather than writing tests upfront), using Vitest + React Testing Library for component tests and Playwright for full click-through tests across Chrome, Firefox, and Safari engines.

- A. Yes — write code then tests right after, using that toolset (Vitest/RTL + Playwright)
- B. I'd rather write tests before the code (test-first style)
- C. Use different tools than proposed (please specify)
- X. Other (please specify)

[Answer]: A. Yes — write code then tests right after, using that toolset (Vitest/RTL + Playwright)

## Q4. How much test coverage, and how deep should the invitation-card tests go?
The default is 80% of code covered by tests. For the card export specifically, a test that just checks "did it crash?" won't catch a card with garbled text or a QR code pointing at the wrong link — so the reviewers propose tests that actually open the generated PDF and QR code and check the content is correct, not just that nothing crashed.

- A. Yes to both — 80% overall, and open/verify the actual PDF text + QR content in tests
- B. 80% overall is fine, but don't go as deep on verifying PDF/QR content — a "didn't crash" check is enough for now
- C. A different coverage number (please specify)
- X. Other (please specify)

[Answer]: B. 80% overall is fine, but don't go as deep on verifying PDF/QR content — a "didn't crash" check is enough for now

## Q5. Should every merge to `main` automatically deploy to the live hosted instance, or do you want a manual confirmation step before each deploy?
There's only one hosted copy of the app (no separate test/staging copy), so "deploy" here means the one real, live version teammates use.

- A. Auto-deploy on every merge — no manual step
- B. I want to manually confirm/trigger each deploy
- X. Other (please specify)

[Answer]: A. Auto-deploy on every merge — no manual step

## Q6. Code organization: should the UI never talk directly to browser storage or the PDF/QR engine — always going through a shared state layer in between?
This keeps the three concerns (what's on screen, what's saved, and how the card is generated) from getting tangled together as the app grows, which the reviewer flagged as the biggest risk of things getting messy over time in an app like this.

- A. Yes, enforce that separation
- B. Don't worry about it — keep it simpler even if less strictly layered
- X. Other (please specify)

[Answer]: A. Yes, enforce that separation

## Q7. Since this data is people's names, emails, and meeting details stored only in the browser (never sent anywhere), a few security basics were flagged: scanning for accidentally-committed secrets, scanning dependencies for known vulnerabilities, and checking code for common security mistakes (like unsafely inserting user text into the page) — all automatically, before each merge. Set these up from the start?
- A. Yes, set up all three (secret scanning, dependency scanning, code security checks)
- B. Just dependency scanning — skip the others for now
- C. Skip all of this for now — revisit later if needed
- X. Other (please specify)

[Answer]: A. Yes, set up all three (secret scanning, dependency scanning, code security checks)

## Q8. Since anyone with the link can reach the hosted app (no login), should there be a visible "clear my data" button so people can wipe their locally-stored meeting info from that browser?
- A. Yes, include a "clear my data" action
- B. Not needed for now
- X. Other (please specify)

[Answer]: A. Yes, include a "clear my data" action

## Q9. Should accessibility be checked automatically (e.g. screen-reader/keyboard-navigation basics on the forms and card preview), and should mobile browsers be covered by testing, or is this a desktop-only tool for v1?
- A. Yes to accessibility checks (as a non-blocking check for now), and desktop-only browser testing is fine for v1
- B. Yes to accessibility checks AND mobile browser testing both
- C. Skip both for now — desktop-only, no accessibility automation yet
- X. Other (please specify)

[Answer]: B. Yes to accessibility checks AND mobile browser testing both

## Assumptions & Open Questions

None.
