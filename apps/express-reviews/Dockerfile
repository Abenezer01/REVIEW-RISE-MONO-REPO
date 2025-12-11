FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json .
COPY tsconfig.json .
COPY src ./src

RUN npm install
RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/package.json .
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3006

CMD ["npm", "start"]
