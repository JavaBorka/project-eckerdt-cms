# Project overview — Eckerdt CMS

## Goal

Build a small CMS with a React/TypeScript administration interface, a Node.js backend, a PostgreSQL data model and a public website. The main mentoring goal is to learn REST API design, request processing, validation, relational data modeling, and backend business rules.

## Scope — CMS administration

- **Articles:** create and edit a full article and its distinct preview together; one author and one category per article; main image, preview image, Plate rich-text content, unique slug.
- **Authors:** create, list, rename, delete; author names unique after trimming surrounding whitespace and ignoring case. Deleting an author reassigns its articles to protected author `Unknown` (`id = -1`).
- **Categories:** create, list, rename, delete; category names unique with the same normalization. Deleting a category reassigns its articles to protected category `Unknown` (`id = -1`). No category slug.
- **Media Library:** register media through external `url` with `fileName` and `mediaType` (`image`, `video`, `audio`); select existing media from Plate UI. Prevent deleting referenced media (including references inside Plate JSON, checked by backend).
- **Hero banners:** manage banners as active/inactive; a banner has rich text and image. At most one active published banner is visible. Publishing another deactivates the previous one, clearing its status and publication timestamp in one transaction.

## Publishing lifecycle

- Article and its preview are one publication unit: both are saved or published together.
- Active items have `status: draft` or `published`. Inactive items have `status: null`, `isActive: false`, and `publishedAt: null`.
- Creating or editing an active draft supports **Save draft** and **Publish**. Required fields apply to drafts too.
- Editing an already published article or banner exposes **Publish** only; unsaved form edits do not affect the live site.
- DELETE deactivates and clears `status` and `publishedAt`. PATCH on the same `/{id}` URL restores `status: draft`, `isActive: true`, and `publishedAt: null`.
- Inactive articles and banners must be restored before editing. Restored content is not publicly visible until republished.

## Public website

- Homepage: fixed React navigation, visible hero banner if available, paginated article-preview cards.
- Initially display all active published articles, newest published first; category menu filters cards on homepage.
- Article details: public route `/articles/:idSlug` (e.g. `/articles/12-my-article`). React extracts the ID and fetches article details by ID; article slug remains editable and globally unique.
- About the Author page is static React content; no public authors management endpoint.
- Only active, published articles (and their previews) are available publicly.

## Architecture

- **React:** forms (React Hook Form / Zod planned), admin UI, Plate editor, public routes.
- **Node.js:** CMS management and public read-only API; validates requests and enforces publishing, deletion and reference rules.
- **Netlify Database (PostgreSQL):** five tables `authors`, `categories`, `media`, `articles`, `hero_banners`; preview stored in `articles`; Plate content stored as `JSONB`.
- **External media host:** DB stores metadata/URL, not binary files.
- **OpenAPI:** see `openapi.yaml`; API uses numeric resource identifiers and `limit` request / `pageSize` response for paginated listings (default 10; clamp 5–100). Categories and Authors are unpaginated.

## Decisions still for mentoring

- Choose Node.js backend framework, ORM or SQL access approach, and media provider.
- Agree on JSON API error format and media URL verification/security.
- Agree on how to find media IDs embedded in Plate JSON before allowing deletion.
- Hosting: Netlify for the frontend and **Netlify Database** for managed PostgreSQL; Node.js backend deployment architecture remains to be finalized. MVP has no login: do not expose CMS write endpoints publicly.

## Confirmed database decisions (2026-11-15)

- New, empty PostgreSQL database; no data migration needed.
- Unknown author/category (ID `-1`) protections enforced by backend validation, not database triggers.
- Backend maintains `updated_at` on mutations; no timestamp trigger.
- Article slugs use case-sensitive `UNIQUE(slug)` and remain unique across inactive records.
- `published_at` is included for accurate newest-published ordering; it keeps the initial publish timestamp within an activation cycle and is cleared on deactivation.
- Publication history is intentionally discarded on deactivation (`published_at = NULL`).
- Media `url` uses `VARCHAR(2048)`, with OpenAPI `maxLength: 2048`.
- Public API returns a bare hero banner object or JSON null when none is published.
