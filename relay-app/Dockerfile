# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# VITE_RELAY_API_SECRET must be passed as a build arg so Vite bakes it into the bundle
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
