# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# RELAY_READ_TOKEN is the read-side token baked into the frontend bundle at build time.
# It is lower-sensitivity than JANUS_SECRET (prevents casual enumeration, not a high-value secret).
# Set it in fly.toml [build.args] or pass via --build-arg on deploy.
ARG VITE_RELAY_API_SECRET
ENV VITE_RELAY_API_SECRET=$VITE_RELAY_API_SECRET
RUN npm run build

# Runtime stage
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
COPY server ./server
ENV NODE_ENV=production
EXPOSE 8080
CMD ["node_modules/.bin/tsx", "server/index.ts"]
