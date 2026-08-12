FROM node:24-bookworm-slim

WORKDIR /app

# Copy package files and the root prisma config file
COPY package*.json prisma.config.ts* ./

# Copy the prisma folder (schema, migrations, etc.)
COPY prisma ./prisma

# Install dependencies and openssl
RUN npm install \
    && apt-get update \
    && apt-get install -y openssl

# Copy the rest of the application code
COPY . .

EXPOSE 3000

CMD ["sh", "-c", "npx prisma generate && npx prisma migrate deploy && npm run start"]