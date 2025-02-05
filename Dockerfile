# Use Node.js image
FROM node:20

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
EXPOSE 3002
EXPOSE 5555

# Start the application
CMD ["npm", "run", "start:dev"]