# Multi-Stage Production Dockerfile for SiPesand SaaS
FROM node:20-alpine AS builder

WORKDIR /app

# 1. Build Frontend
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install
COPY frontend ./frontend
RUN cd frontend && npm run build

# 2. Setup Backend
COPY backend/package*.json ./backend/
RUN cd backend && npm install
COPY backend ./backend
RUN cd backend && npx prisma generate

# Final Runner Stage
FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/frontend/dist ./frontend/dist
COPY --from=builder /app/backend ./backend
COPY serve-frontend.js ./
COPY ecosystem.config.js ./
COPY package.json ./

RUN npm install express dotenv

EXPOSE 3000 5000

CMD ["node", "backend/src/server.js"]
