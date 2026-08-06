FROM node:24-bookworm-slim

WORKDIR /app

# copie package.json et package-lock.json vers le conteneur
COPY package*.json ./

COPY prisma ./prisma

# installe les dependances dans node_modules du conteneur
RUN npm install

# genere les fichiers client Prisma dans le conteneur durant la pahse de build
RUN npx prisma generate

COPY . .

# compile le code TypeScript en JavaScript dans le dossier dist
RUN npm run build

# DEBUG: Print contents of dist so we can see the exact path structure
RUN ls -R /app/dist

EXPOSE 3000

# lance directement la node en tatn que processus principal du conteneur, ce qui permet de recevoir les signaux d'arrêt correctement
CMD ["node", "dist/src/main.js"]