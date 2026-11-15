-- Normalize name uniqueness by ignoring surrounding whitespace and case.
CREATE UNIQUE INDEX authors_name_normalized_uq ON authors (lower(btrim(name)));
CREATE UNIQUE INDEX categories_name_normalized_uq ON categories (lower(btrim(name)));

-- At most one publicly visible hero banner. Publishing/replacement must use a transaction.
CREATE UNIQUE INDEX hero_banners_one_visible_uq
    ON hero_banners (status)
    WHERE is_active = TRUE AND status = 'published';

CREATE INDEX articles_category_id_idx ON articles (category_id);
CREATE INDEX articles_author_id_idx ON articles (author_id);
-- FIXED from the old script: publication order uses published_at, not created_at.
CREATE INDEX articles_published_at_idx
    ON articles (published_at DESC, id DESC)
    WHERE is_active = TRUE AND status = 'published';
CREATE INDEX hero_banners_created_at_idx ON hero_banners (created_at DESC, id DESC);
CREATE INDEX media_type_idx ON media (media_type);
