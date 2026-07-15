# syntax=docker/dockerfile:1

# base

FROM ghcr.io/pnpm/pnpm:11 AS base
RUN pnpm runtime set node 26 -g

WORKDIR /monorepo

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./
COPY packages/ ./packages/
COPY apps/app-ui/ ./apps/app-ui/
COPY apps/app/package.json ./apps/app/package.json

RUN pnpm install --frozen-lockfile

# run app-ui in dev mode

FROM base AS ui-dev

COPY packages/ ./packages/
COPY apps/app-ui/ ./apps/app-ui/

EXPOSE 5321

# build app-ui

FROM base AS ui-build

COPY packages/ ./packages/
COPY apps/app-ui/ ./apps/app-ui/

RUN pnpm nx build app-ui

# host static app-ui build

FROM nginx:alpine AS ui-prod

COPY --from=ui-build /monorepo/apps/app-ui/dist /usr/share/nginx/html

EXPOSE 80
