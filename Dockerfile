FROM mcr.microsoft.com/playwright:v1.54.2 AS base

# Install Bun
RUN apt-get update
RUN apt-get install -y unzip

# Install Bun and add to PATH
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:$PATH"

# Install Claude Code globally
RUN bun install -g @anthropic-ai/claude-code

FROM base AS build

# Copy CLI source
COPY cli/ /app/cli/
WORKDIR /app/cli

# Install CLI dependencies and build
RUN bun install
RUN bun run build

FROM base AS prod

# Copy dist
COPY --from=build /app/cli/dist/cc-test-runner /app/cc-test-runner
WORKDIR /app

# Start built CLI
ENTRYPOINT ["/bin/bash"]