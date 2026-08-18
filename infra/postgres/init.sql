-- Database bootstrap. Runs once, on first start of an empty data volume.
--
-- Two things happen here and nothing else: the extensions the schema and the
-- search implementation depend on, and a dedicated text-search configuration so
-- message search is accent-insensitive and stemmed. Application tables are the
-- migrations' business, never this file's.

\set ON_ERROR_STOP on

-- Trigram matching backs autocomplete and fuzzy name lookup.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Accent folding for search over names and message text.
CREATE EXTENSION IF NOT EXISTS unaccent;

-- GIN over scalar columns, so a composite index can mix a tsvector with a
-- workspace predicate.
CREATE EXTENSION IF NOT EXISTS btree_gin;

-- Search configuration: unaccent first, then English stemming.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_ts_config WHERE cfgname = 'relay_search') THEN
    CREATE TEXT SEARCH CONFIGURATION relay_search ( COPY = english );
    ALTER TEXT SEARCH CONFIGURATION relay_search
      ALTER MAPPING FOR hword, hword_part, word
      WITH unaccent, english_stem;
  END IF;
END
$$;

-- A separate database for the integration suite, so a test run can never touch
-- development data. Container-per-run tests provision their own database and
-- ignore this one.
SELECT 'CREATE DATABASE relay_test'
WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'relay_test')\gexec

\connect relay_test

CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS btree_gin;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_ts_config WHERE cfgname = 'relay_search') THEN
    CREATE TEXT SEARCH CONFIGURATION relay_search ( COPY = english );
    ALTER TEXT SEARCH CONFIGURATION relay_search
      ALTER MAPPING FOR hword, hword_part, word
      WITH unaccent, english_stem;
  END IF;
END
$$;
