FROM node:22-bookworm-slim

ENV COREPACK_HOME=/tmp/corepack

RUN corepack enable \
    && corepack prepare pnpm@11.21.0 --activate

WORKDIR /workspace

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY scripts/preinstall.mjs scripts/preinstall.mjs
COPY artifacts/api-server/package.json artifacts/api-server/package.json
COPY artifacts/khadematy-site/package.json artifacts/khadematy-site/package.json
COPY artifacts/mockup-sandbox/package.json artifacts/mockup-sandbox/package.json
COPY lib/api-client-react/package.json lib/api-client-react/package.json
COPY lib/api-spec/package.json lib/api-spec/package.json
COPY lib/api-zod/package.json lib/api-zod/package.json
COPY lib/db/package.json lib/db/package.json
COPY scripts/package.json scripts/package.json

RUN pnpm install --frozen-lockfile --node-linker=hoisted --store-dir=/pnpm/store
RUN mkdir -p /root/.config/pnpm \
    && printf '%s\n' 'node-linker=hoisted' 'store-dir=/pnpm/store' 'confirmModulesPurge=false' > /root/.config/pnpm/rc

COPY docker/frontend/entrypoint.sh /usr/local/bin/ahd-frontend-entrypoint
RUN chmod +x /usr/local/bin/ahd-frontend-entrypoint

EXPOSE 5173

ENTRYPOINT ["ahd-frontend-entrypoint"]
CMD ["node", "/workspace/node_modules/vite/bin/vite.js", "--config", "/workspace/artifacts/khadematy-site/vite.config.ts", "--host", "0.0.0.0"]
