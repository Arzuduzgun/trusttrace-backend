FROM node:22-slim

WORKDIR /app
ENV HUSKY=0
RUN npm install -g pnpm@9.15.4

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build && touch .env

ENV NODE_ENV=production
EXPOSE 4000
CMD ["sh", "-c", "if [ -f dist/main.js ]; then node dist/main.js; else node dist/src/main.js; fi"]
