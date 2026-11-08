# 02 Indexes

```sql
-- Case-insensitive uniqueness, ignoring whitespace at both ends.
-- A UNIQUE(name) constraint alone would not enforce these rules.
CREATE UNIQUE INDEX authors_name_normalized_uq ON authors (lower(btrim(name)));
CREATE UNIQUE INDEX categories_name_normalized_uq ON categories (lower(btrim(name)));

-- Prevent two active published hero banners simultaneously.
-- The backend must deactivate the previous banner and publish the new one
-- in ONE transaction, in that order.
CREATE UNIQUE INDEX hero_banners_one_visible_uq
    ON hero_banners (status)
    WHERE is_active = TRUE AND status = 'published';

-- Useful for lookups and default newest-first listing.
CREATE INDEX articles_category_id_idx ON articles (category_id);
CREATE INDEX articles_author_id_idx ON articles (author_id);
CREATE INDEX articles_published_at_idx ON articles (created_at DESC, id DESC)
    WHERE status = 'published' AND is_active = TRUE;
CREATE INDEX hero_banners_created_at_idx ON hero_banners (created_at DESC, id DESC);
CREATE INDEX media_type_idx ON media (media_type);
```
