# Task 2 — Shared Page and Component Contracts

**Goal:** Define one versioned, runtime-validated page format shared by the API, admin, and SSR website. Keep this package independent of Angular, Express, and MongoDB.

**Scope for this task:** page metadata and two component types (`hero` and `text-section`). Do not add styling, animations, responsive settings, publishing, persistence, or editor UI yet.

## 1. Add runtime schema dependency

From the repository root, add Zod to the contracts workspace:

```bash
npm install zod -w @placta/contracts
```

Keep the root lockfile as the only lockfile. The contracts package should own the schema dependency because the schemas are defined there.

## 2. Create the contract modules

Use this structure:

```text
packages/contracts/src/
├── components.ts
├── page.ts
└── index.ts
```

Use Zod schemas as the source of truth and derive TypeScript types with `z.infer`; do not maintain separate handwritten interfaces for the same data.

## 3. Define the supported component schemas

Every component has:

- `id`: non-empty string, unique within a page.
- `type`: a fixed literal for its component kind.
- `schemaVersion`: literal `1`.
- `content`: a strict object containing only supported fields.

For v1 of these contracts, define:

- **Hero (`hero`)**: required `heading`; optional `subtitle`, `ctaText`, and `ctaHref`.
- **Text section (`text-section`)**: required `heading` and `body`.

Use sensible string length limits and reject unknown keys. `ctaHref`, when present, must be a safe local path or an `https:` URL; reject `javascript:`, `data:`, and protocol-relative URLs. Do not allow arbitrary HTML or executable content.

Export the individual schemas and inferred types, plus a discriminated union schema/type for all supported components.

## 4. Define the page schema

A page has:

- `schemaVersion`: literal `1`.
- `title`: non-empty, length-limited string.
- `slug`: `/` for the homepage, otherwise a lowercase URL-safe path segment such as `about-us` (do not include leading/trailing slashes).
- Optional `seo` object with optional `title` and `description` strings.
- `components`: ordered array of the supported component union.

Reject reserved slugs, case-insensitively, including `api`, `admin`, and other routes already used by the applications. Keep reserved-route definitions centralized so they can be updated in one place. Reject duplicate component IDs within a page.

Export the page schema and its inferred TypeScript type.

## 5. Expose a stable package API

Export all public schemas and inferred types from `packages/contracts/src/index.ts`. Consumer code should import from `@placta/contracts`, not reach into `src/components` or `src/page` directly.

Add the workspace dependency to each app that needs the contracts (`@placta/api`, `@placta/admin`, and `@placta/website`) using npm workspaces. Confirm package exports and TypeScript resolution work in the existing project setup; do not introduce app-specific copies of the schemas.

## 6. Add fixtures and focused validation checks

Create a sample page fixture with one Hero and one Text Section. Add focused tests using the repository's existing test setup, or a small contracts test setup if needed, to verify:

- The sample page parses successfully.
- An unknown component type is rejected.
- An invalid/reserved slug is rejected.
- Duplicate component IDs are rejected.
- Unexpected fields are rejected.
- Unsafe CTA URLs are rejected.

Tests should assert validation results/errors, not just that the test command exits successfully.

## Done when

- API, admin, and website can import the public contract API by package name.
- A valid sample page parses and has inferred types available to all consumers.
- The invalid cases above fail validation.
- No framework, database, or rendering implementation has been added to the contracts package.
