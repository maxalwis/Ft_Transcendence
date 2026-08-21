FROM node:20-alpine

WORKDIR /app

# copie package.json et package-lock.json vers le conteneur
COPY package*.json ./

# installe les dependances dans node_modules du conteneur
RUN npm install

COPY . .

CMD ["node", "worker.js"]