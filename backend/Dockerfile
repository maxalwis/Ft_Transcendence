FROM docker.io/library/node:20-alpine

WORKDIR /app

# Copy package files and the root prisma config file
COPY package*.json prisma.config.ts* ./

# Copy the prisma folder (schema, migrations, etc.)
COPY prisma ./prisma

# Install dependencies and OpenSSL/wget via Alpine package manager (apk)
RUN apk add --no-cache openssl wget \
    && npm install

# Copy the rest of the application code
COPY . .

EXPOSE 3000

CMD npx prisma generate && \
    npx prisma migrate deploy && \
    npm run build && \
    npm run start:prod