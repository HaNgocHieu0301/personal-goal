FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Tạo biến môi trường bỏ qua Next.js Root lú lẫn
ENV NEXT_PRIVATE_STANDALONE true
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
# Copy chính xác tuyệt đối các file Standalone của Next ra Root
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Nếu Standalone bị lỗi đường dẫn sâu, nó vẫn sẽ build nhưng chạy lệnh này
CMD ["node", "server.js"]
