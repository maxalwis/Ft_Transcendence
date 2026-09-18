FROM docker.io/library/node:20-alpine

WORKDIR /app

COPY package*.json prisma.config.ts* ./

COPY prisma ./prisma

RUN apk add --no-cache openssl wget \
    && npm ci \
    && npx prisma generate

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start:dev"]