FROM node:18-alpine AS builder

WORKDIR /app

# Note: In a monorepo, you typically build from the root context or use Turbo.
# This assumes a simplified build or that necessary packages can be installed/copied.
# For a robust monorepo build, consider using a tool like Turbo or copying the full monorepo.

COPY package.json .
COPY tsconfig.json .
COPY src ./src

# If this package depends on local workspace packages, this simple install might fail 
# without the workspace context. Adjust as needed for specific monorepo build tools.
RUN npm install
RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/package.json .
COPY --from=builder /app/dist ./dist
# COPY --from=builder /app/node_modules ./node_modules 

EXPOSE 3010

CMD ["npm", "start"]
