#!/bin/bash
# Local testing script for x-imperium
# Usage: ./scripts/test-local.sh

set -e

echo "=== x-imperium Local Test Suite ==="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

# 1. PHP Syntax Check
echo "1. Running PHP syntax check..."
SYNTAX_ERRORS=0
for file in $(find . -name "*.php" -not -path "./vendor/*" -not -path "./templates_c/*"); do
    if ! php -l "$file" > /dev/null 2>&1; then
        echo -e "${RED}SYNTAX ERROR:${NC} $file"
        php -l "$file"
        SYNTAX_ERRORS=$((SYNTAX_ERRORS + 1))
    fi
done

if [ $SYNTAX_ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ PHP syntax check passed${NC}"
else
    echo -e "${RED}✗ $SYNTAX_ERRORS files with syntax errors${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 2. Docker Build Test
echo "2. Building Docker image..."
if docker compose build web > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Docker build successful${NC}"
else
    echo -e "${RED}✗ Docker build failed${NC}"
    docker compose build web 2>&1 | tail -20
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 3. Container Startup Test
echo "3. Testing container startup..."
docker compose up -d > /dev/null 2>&1
sleep 5

if docker compose ps web | grep -q "Up"; then
    echo -e "${GREEN}✓ Containers started successfully${NC}"

    # 4. HTTP Response Test
    echo ""
    echo "4. Testing HTTP response..."
    sleep 5  # Give Apache time to fully start

    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/ 2>/dev/null || echo "000")

    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "302" ]; then
        echo -e "${GREEN}✓ HTTP response: $HTTP_CODE${NC}"
    elif [ "$HTTP_CODE" = "500" ]; then
        echo -e "${RED}✗ HTTP 500 Error - Check logs:${NC}"
        docker compose logs web 2>&1 | tail -30
        ERRORS=$((ERRORS + 1))
    else
        echo -e "${YELLOW}⚠ HTTP response: $HTTP_CODE (may need database init)${NC}"
    fi
else
    echo -e "${RED}✗ Container failed to start${NC}"
    docker compose logs web 2>&1 | tail -30
    ERRORS=$((ERRORS + 1))
fi

# Cleanup
echo ""
echo "Cleaning up..."
docker compose down > /dev/null 2>&1

echo ""
echo "=== Test Summary ==="
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}$ERRORS test(s) failed${NC}"
    exit 1
fi
