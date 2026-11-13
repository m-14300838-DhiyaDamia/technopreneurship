# Single-container deployment: Node serves the API, websockets and the built frontend.
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY server/package*.json server/
COPY client/package*.json client/
RUN npm ci --omit=dev --ignore-scripts && npm --prefix server ci --omit=dev && npm --prefix client ci
COPY . .
RUN npm --prefix client run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/server ./server
COPY --from=build /app/client/dist ./client/dist
COPY package.json ./
EXPOSE 4000
CMD ["node", "server/src/index.js"]
