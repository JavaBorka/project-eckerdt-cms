# Database schema — PostgreSQL

Five tables. The color palette visually groups entities; it has no database semantics. `PK` = Primary Key, `FK` = Foreign Key, `UK` = unique logical constraint/index.

```mermaid
flowchart TB
    A["AUTHORS<br/>id INTEGER [PK]<br/>name VARCHAR(255) [UK]"]
    C["CATEGORIES<br/>id INTEGER [PK]<br/>name VARCHAR(255) [UK]<br/>is_system BOOLEAN"]
    M["MEDIA<br/>id INTEGER [PK]<br/>file_name VARCHAR(255)<br/>media_type VARCHAR(20)<br/>url VARCHAR(2048)"]
    ART["ARTICLES<br/>id INTEGER [PK]<br/>title VARCHAR(255)<br/>slug VARCHAR(255) [UK]<br/>author_id INTEGER [FK]<br/>category_id INTEGER [FK]<br/>main_image_id INTEGER [FK]<br/>content JSONB<br/>preview_image_id INTEGER [FK]<br/>preview_content JSONB<br/>status VARCHAR(20) NULL<br/>is_active BOOLEAN<br/>published_at TIMESTAMPTZ NULL<br/>created_at TIMESTAMPTZ<br/>updated_at TIMESTAMPTZ"]
    H["HERO_BANNERS<br/>id INTEGER [PK]<br/>image_id INTEGER [FK]<br/>content JSONB<br/>status VARCHAR(20) NULL<br/>is_active BOOLEAN<br/>published_at TIMESTAMPTZ NULL<br/>created_at TIMESTAMPTZ<br/>updated_at TIMESTAMPTZ"]
    A -->|"1 : 0..N — author_id"| ART
    C -->|"1 : 0..N — category_id"| ART
    M -->|"1 : 0..N — main_image_id"| ART
    M -->|"1 : 0..N — preview_image_id"| ART
    M -->|"1 : 0..N — image_id"| H
    style A fill:#dceafa,color:#19334d,stroke:#7b9ab8
    style C fill:#dceafa,color:#19334d,stroke:#7b9ab8
    style ART fill:#dcefe5,color:#183c2c,stroke:#75a68b
    style M fill:#f4e8d4,color:#563c1d,stroke:#c4a474
    style H fill:#f1e2ee,color:#542f4d,stroke:#b08aab
```

## Meaning of relationships

| Relationship | Cardinality | Business meaning |
| --- | --- | --- |
| Authors → Articles | 1 : 0..N | One author may have zero or many articles; each article must have exactly one author. |
| Categories → Articles | 1 : 0..N | One category may contain zero or many articles; each article must have exactly one category. |
| Media → Articles (main_image_id) | 1 : 0..N | Media may be the main image for many articles; each article must have one main image. |
| Media → Articles (preview_image_id) | 1 : 0..N | Media may be used in many previews; each article must have one preview image. |
| Media → HeroBanners (image_id) | 1 : 0..N | Media may appear in many banners; each banner must have one image. |

## Constraints and backend rules

- Author and category normalized names are unique (`lower(btrim(name))`) using expression indexes.
- Article slugs are globally unique, including for inactive articles.
- System records `Unknown` have ID `-1`; application must protect against modification/deletion.
- Article preview is saved in the same row as article, not a separate table.
- Media binary files are external; only metadata and URL are stored in PostgreSQL.
- `content` and `preview_content` are nonempty JSON arrays; Plate node validation belongs in backend.
- Partial unique index enforces at most one active published banner.
- Soft deletion is represented by `is_active` rather than deleting database rows.
- Direct media foreign keys prevent deletion while referenced. References embedded in Plate JSON require additional backend checks.

## Publication lifecycle (articles and hero banners)

| is_active | status | published_at | Meaning |
|---|---|---|---|
| TRUE | draft | NULL | Active draft, hidden publicly |
| TRUE | published | timestamp | Active published, public |
| FALSE | NULL | NULL | Inactive, hidden publicly |

`published_at` records first publication in the current activation cycle. Publishing updates to an already active published item does not change it; deactivation clears both `status` and `published_at`. Restoration makes an active draft. Publishing a different hero banner deactivates the previous one atomically.

## Confirmed implementation decisions

- Database provider: **Netlify Database** (managed PostgreSQL); frontend hosting: Netlify. Node.js execution model is still to be chosen.
- New empty database; create-table scripts are not migrations of existing populated tables.
- Backend protects Unknown author/category records and maintains `updated_at`; no database triggers for these rules.
- `UNIQUE(slug)` is case-sensitive and global.
- Publication history is not preserved after deactivation.
- Media `url` is `VARCHAR(2048)`, and OpenAPI matches via `maxLength: 2048`.
- Media references inside Plate JSON require backend validation.
- Keep SQL under `src/docs/sql` for documentation; deploy Netlify Database schema through committed migrations as described in `netlify-database.md`.
