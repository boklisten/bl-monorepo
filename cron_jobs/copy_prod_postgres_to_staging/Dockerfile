FROM postgres:18-alpine

CMD sh -c ' \
  psql "$TARGET_DATABASE_URL" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;" && \
  pg_dump --no-owner --no-privileges --no-acl "$SOURCE_DATABASE_URL" | psql "$TARGET_DATABASE_URL"'
