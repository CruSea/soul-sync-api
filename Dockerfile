# Use Node.js image
FROM node:20-alpine

# Install OpenSSL dependencies
RUN apk add --no-cache openssl

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Generate Prisma client
RUN npx prisma generate

# Copy application code
COPY . .

# Build the NestJS application
RUN npm run build

# Expose application port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start:prod"]
