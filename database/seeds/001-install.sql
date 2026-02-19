DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'marcus') THEN
    CREATE ROLE marcus LOGIN PASSWORD 'marcus';
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'application') THEN
    CREATE DATABASE application OWNER marcus;
  END IF;
END
$$;
