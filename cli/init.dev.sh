#!/bin/bash
echo "Starting init.dev.sh..."

# Check if Bun is already installed
if ! command -v bun &> /dev/null; then
    echo "Installing Bun..."
    curl -fsSL https://bun.sh/install | bash
else
    echo "Bun is already installed: $(bun --version)"
fi

bun install

echo "Installing Chrome browser for Playwright..."
bunx playwright install chrome

echo "Installing Claude Code..."
bun install -g @anthropic-ai/claude-code

echo "Configuring MCP servers..."
claude mcp add playwright --scope project bunx @playwright/mcp@v0.0.31
claude mcp add testState --scope project --transport http http://localhost:3001

echo "Finished init.dev.sh!"
