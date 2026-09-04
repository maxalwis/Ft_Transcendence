FROM docker.io/library/node:20-alpine

WORKDIR /app

# Copy dependency definitions first to leverage Docker layer caching
COPY package*.json ./

# Install dependencies during image build
RUN npm install --no-audit

# Copy source code (will be overridden by bind mount in dev mode)
COPY . .

# Expose Vite's default development port
EXPOSE 5173

# Run the dev server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]