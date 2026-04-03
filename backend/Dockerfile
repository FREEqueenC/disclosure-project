FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (only production to save space and time)
RUN npm install

# Copy source code
COPY . .

# Global install of ts-node (or we could use npx, but this is explicit)
# RUN npm install -g ts-node typescript

# Expose the Cloud Run default port
EXPOSE 8080

# Environment variables (Can be overridden by Cloud Run)
ENV PORT=8080
ENV NODE_ENV=production

# Start the server using ts-node directly
CMD ["npx", "ts-node", "--transpile-only", "index.ts"]
