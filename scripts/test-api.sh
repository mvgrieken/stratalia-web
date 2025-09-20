#!/bin/bash
set -e

DOMAIN=${1:-stratalia.nl}

echo "== Test POST /api/test-post on https://$DOMAIN =="
curl -i -X POST "https://$DOMAIN/api/test-post" \
  -H "Content-Type: application/json" \
  -d '{}'

echo -e "\n== Test POST /api/auth/login-post (dummy credentials) on https://$DOMAIN =="
curl -i -X POST "https://$DOMAIN/api/auth/login-post" \
  -H "Content-Type: application/json" \
  -d '{"email":"dummy@example.com","password":"wrong","redirect_to":"/dashboard"}'

echo -e "\n== Test GET /api/auth/me (not logged in) on https://$DOMAIN =="
curl -i "https://$DOMAIN/api/auth/me"
