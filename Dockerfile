# Install dependencies only when needed
FROM node:lts-alpine AS deps
RUN apk add --no-cache libc6-compat
RUN apk add --no-cache git
RUN apk add --no-cache openssh
WORKDIR /app
COPY ./dapp/package.json .
RUN npm install

# Rebuild the source code only when needed
FROM node:lts-alpine AS builder
RUN apk add --no-cache git
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./dapp/node_modules
RUN npm install
RUN npx hardhat compile
RUN npm --prefix ./dapp run build

# Production image, copy all the files and run next
FROM node:lts-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# You only need to copy next.config.js if you are NOT using the default configuration
COPY --from=builder /app/dapp/next.config.js ./
COPY --from=builder /app/dapp/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/dapp/.next ./.next
COPY --from=builder /app/dapp/node_modules ./node_modules
COPY --from=builder /app/dapp/package.json ./package.json

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node_modules/.bin/next", "start"]
