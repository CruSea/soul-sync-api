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

# Copy application code
COPY . .

# Run Prisma generate
RUN npx prisma generate

# Run Prisma migrate
RUN npx prisma migrate

# Build the NestJS application
RUN npm run build

# Expose application port
EXPOSE 3000
EXPOSE 5432
EXPOSE 3002

# Start the application
CMD ["npm", "run", "start:prod"]