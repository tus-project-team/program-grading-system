#!/bin/sh
set -e

# Remove existing db if exists
if [ -f /app/db/prod.db ]; then
    mv /app/prisma/data/deploy.db /app/prisma/data/deploy.db.bak
fi

# Restore database from GCS if exists
./litestream restore -if-replica-exists -config /app/litestream.yml /app/prisma/data/deploy.db

if [ -f /app/prisma/data/deploy.db ]; then
    echo "Successfully restored database from Cloud Storage"
    rm -f /app/prisma/data/deploy.db.bak
else
    echo "No database backup found in Cloud Storage, using original"
    mv /app/prisma/data/deploy.db.bak /app/prisma/data/deploy.db.db
fi

# Start Litestream replication with the app as the subprocess
exec ./litestream replicate \
    -config /app/litestream.yml \
    -exec "./app"
