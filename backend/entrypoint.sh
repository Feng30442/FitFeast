#!/bin/sh

set -e

DB_HOST=${DB_HOST:-${POSTGRES_HOST:-localhost}}
DB_PORT=${DB_PORT:-${POSTGRES_PORT:-5432}}

echo "Waiting for database ${DB_HOST}:${DB_PORT} ..."
python - <<'PY'
import os, socket, time, sys
host = os.environ.get('DB_HOST') or os.environ.get('POSTGRES_HOST', 'localhost')
port = int(os.environ.get('DB_PORT') or os.environ.get('POSTGRES_PORT', '5432'))
for i in range(60):
    try:
        with socket.create_connection((host, port), timeout=2):
            sys.exit(0)
    except OSError:
        time.sleep(1)
print(f"Database not reachable: {host}:{port}", file=sys.stderr)
sys.exit(1)
PY

echo "Applying database migrations..."
python manage.py makemigrations api
python manage.py migrate

echo "Creating admin user..."
python manage.py create_admin

exec "$@"
