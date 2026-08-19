FROM node:24.19.0-bookworm-slim AS dependencies

WORKDIR /app

RUN corepack enable

COPY package.json yarn.lock .yarnrc.yml ./
RUN yarn install --immutable

FROM dependencies AS build

COPY tsconfig.json tsconfig.build.json ./
COPY src ./src
COPY config ./config

RUN yarn build
RUN yarn workspaces focus --all --production

FROM node:24.19.0-bookworm-slim AS runtime

ENV NODE_ENV=production
WORKDIR /app

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/config ./config

USER node
EXPOSE 3000

CMD ["node", "dist/server.js"]