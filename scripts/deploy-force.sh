#!/bin/bash
set -e
vercel --prod --force
echo "== Deployment triggered. Run ./scripts/test-api.sh after deploy is live =="

#!/bin/bash
set -e

echo "== Force deploying to Vercel =="
vercel --prod --force

echo "== Deployment triggered. Run ./scripts/test-api.sh after deploy is live =="
