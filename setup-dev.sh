#!/usr/bin/env bash

echo -e "Setting up development environment...\n"

echo "🔴 Starting local docker containers..."
docker-compose up -d
echo -e "✅ Containers started...\n"

echo "🔴 Installing dependencies..."
rm -rf .nx-cache
npm run deps
echo -e "✅ Dependencies installed...\n"

echo "🔴 Running database migrations for microservices..."
npm run migrate:all
echo -e "✅ Database migrations completed...\n"

echo "🔴 Seeding testing data..."
npm run seed:all
echo -e "✅ Testing data seeded...\n"
