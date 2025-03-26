#!/bin/bash

# Get the preview URL from Vercel CLI or environment variable
PREVIEW_URL=${VERCEL_URL:-"http://localhost:3000"}

# Export it for the tests
export NEXT_PUBLIC_API_URL="https://$PREVIEW_URL"

# Run the tests
npm run test:ci 