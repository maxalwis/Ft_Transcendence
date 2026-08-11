FROM docker.io/library/node:20-alpine

WORKDIR /app

# Expose Vite's default development port
EXPOSE 5173

# Run the app with host binding enabled so it's accessible outside the container
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]