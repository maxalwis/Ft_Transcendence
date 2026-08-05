FROM node:24-bookworm-slim

WORKDIR /app

# copie package.json et package-lock.json vers le conteneur
COPY package*.json ./

COPY prisma ./prisma

# installe les dependances dans node_modules du conteneur
RUN npm install

COPY . .

EXPOSE 3000

CMD npx prisma generate && npm run start:dev
