# syntax=docker/dockerfile:1

# base

FROM ghcr.io/pnpm/pnpm:11 AS base
RUN pnpm runtime set node 26 -g

WORKDIR /monorepo

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./
COPY packages/ ./packages/
COPY apps/app-frontend/ ./apps/app-frontend/
COPY apps/app/package.json ./apps/app/package.json

RUN pnpm install --frozen-lockfile

# run app-frontend in dev mode

FROM base AS frontend-dev

COPY packages/ ./packages/
COPY apps/app-frontend/ ./apps/app-frontend/

EXPOSE 5321

# build app-frontend

FROM base AS frontend-build

COPY packages/ ./packages/
COPY apps/app-frontend/ ./apps/app-frontend/

ARG FRONTEND_RELEASE_PUBLIC_KEY
ENV FRONTEND_RELEASE_PUBLIC_KEY=${FRONTEND_RELEASE_PUBLIC_KEY}

RUN --mount=type=secret,id=frontend-release-private-key \
	FRONTEND_RELEASE_PRIVATE_KEY_FILE=/run/secrets/frontend-release-private-key \
	pnpm nx run app-frontend:build:release

# host static app-frontend build

FROM nginxinc/nginx-unprivileged:alpine frontend-prod

COPY --from=frontend-build --chown=101:101 /monorepo/apps/app-frontend/dist /usr/share/nginx/html
COPY --from=frontend-build --chown=101:101 /monorepo/apps/app-frontend/dist/releases /opt/frontend-releases

EXPOSE 8080

CMD ["/bin/sh", "-c", "mkdir -p /usr/share/nginx/html/releases && cp -an /opt/frontend-releases/. /usr/share/nginx/html/releases/ && exec nginx -g 'daemon off;'"]
