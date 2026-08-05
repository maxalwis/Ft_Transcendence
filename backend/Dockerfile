FROM node:24-bookworm-slim

WORKDIR /app

# copie package.json et package-lock.json vers le conteneur
COPY package*.json ./

COPY prisma ./prisma

# installe les dependances dans node_modules du conteneur
RUN npm install

COPY . .

EXPOSE 3000

CMD ["sh", "-c", "npx prisma generate && npx prisma migrate deploy && npm run start:dev"]
