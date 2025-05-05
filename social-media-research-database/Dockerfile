# Step 1: Build the app
FROM node:slim AS builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# Step 2: Serve with Next.js standalone mode
FROM node:alpine
WORKDIR /app

# Only copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.js ./next.config.js

EXPOSE 3000
CMD ["npm", "start"]
