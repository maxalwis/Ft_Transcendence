FROM node:20-alpine

WORKDIR /app

# Copy package files and the root prisma config file
COPY package*.json prisma.config.ts* ./

# Copy the prisma folder (schema, migrations, etc.)
COPY prisma ./prisma

# Install OpenSSL using Alpine's package manager (apk)
RUN apk add --no-cache openssl

# Install node dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

EXPOSE 3000

CMD ["sh", "-c", "npx prisma generate && npx prisma migrate deploy && exec npm run start:dev"]