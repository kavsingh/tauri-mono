# syntax=docker/dockerfile:1

# base

FROM oven/bun:latest AS base

WORKDIR /monorepo

COPY package.json bun.lock tsconfig.base.json ./
COPY packages/ ./packages/
COPY apps/app-ui/ ./apps/app-ui/
COPY apps/app/package.json ./apps/app/package.json

RUN --mount=type=cache,id=bun,target=/root/.local/share/bun/store \
	bun install --frozen-lockfile

# run app-ui in dev mode

FROM base AS ui-dev

EXPOSE 5321

# build app-ui

FROM base AS ui-build

RUN --mount=type=cache,id=bun,target=/root/.local/share/bun/store \
	bun nx build app-ui

# host static app-ui build

FROM nginx:alpine AS ui-prod

COPY --from=ui-build /monorepo/apps/app-ui/dist /usr/share/nginx/html

EXPOSE 80
