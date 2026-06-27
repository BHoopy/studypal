# StudyBuddy API — deploy to Google Cloud Run
#
# Build (from repo root):
#   docker build -t studybuddy-api -f backend/Dockerfile backend
#
# Run locally:
#   docker run --rm -p 8080:8080 --env-file backend/.env -e PORT=8080 studybuddy-api
#
# Deploy:
#   gcloud run deploy studybuddy-api \
#     --source backend \
#     --region us-central1 \
#     --allow-unauthenticated \
#     --set-env-vars "FRONTEND_URL=https://your-frontend.example"
#
# Document worker (separate Cloud Run service — override the command):
#   gcloud run deploy studybuddy-worker \
#     --source backend \
#     --region us-central1 \
#     --no-allow-unauthenticated \
#     --command node \
#     --args dist/worker.js

FROM node:20-bookworm-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run build && npm prune --omit=dev

FROM node:20-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

RUN groupadd --system nodeapp && useradd --system --gid nodeapp nodeapp

COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

USER nodeapp

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 8080) + '/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "dist/index.js"]
