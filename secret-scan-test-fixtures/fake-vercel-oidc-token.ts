// FABRICATED TEST FIXTURE — not a real credential, not wired into any code path.
// Local-only: gitignored (see .gitignore), never committed to this repo.
//
// Structurally a valid JWT (three base64url segments) matching the shape of a
// real Vercel OIDC token, so a format/entropy-based secret scanner (Gitleaks,
// GitHub secret scanning, etc.) has something realistic to flag. The payload's
// claims are all fake/placeholder values and the signature segment is plain
// text ("NOT-A-REAL-SIGNATURE-...") rather than a real RSA signature — it
// cannot authenticate to Vercel or anything else, even if used verbatim.
//
// Usage: point a scanner at this directory to verify it flags this pattern,
// e.g. `gitleaks detect --source secret-scan-test-fixtures --no-git -v`
// (gitleaks isn't installed in this environment; install it first if you
// want to actually run this).

export const FAKE_VERCEL_OIDC_TOKEN =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImZha2Uta2V5LWlkLW5vdC1yZWFsIn0.' +
  'eyJpc3MiOiJodHRwczovL29pZGMudmVyY2VsLmNvbS9mYWtlLW9yZy1mb3Itc2Nhbm5lci10ZXN0aW5nIiwic3ViIjoib3duZXI6ZmFrZS1vcmc6cHJvamVjdDpmYWtlLXByb2plY3Q6ZW52aXJvbm1lbnQ6dGVzdCIsInNjb3BlIjoib3duZXI6ZmFrZS1vcmc6cHJvamVjdDpmYWtlLXByb2plY3Q6ZW52aXJvbm1lbnQ6dGVzdCIsImF1ZCI6Imh0dHBzOi8vdmVyY2VsLmNvbS9mYWtlLW9yZy1mb3Itc2Nhbm5lci10ZXN0aW5nIiwib3duZXIiOiJmYWtlLW9yZy1mb3Itc2Nhbm5lci10ZXN0aW5nIiwicHJvamVjdCI6ImZha2UtcHJvamVjdCIsImVudmlyb25tZW50IjoidGVzdCIsImZha2VfdGVzdF9maXh0dXJlIjp0cnVlLCJpYXQiOjE3MzU2ODk2MDAsImV4cCI6MTczNTY5MzIwMH0.' +
  'Tk9ULUEtUkVBTC1TSUdOQVRVUkUtdGhpcy1pcy1hLWZhYnJpY2F0ZWQtdGVzdC1maXh0dXJlLXRva2VuLWRvLW5vdC11c2U';
