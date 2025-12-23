# Use official Node.js runtime as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Install http-server globally
RUN npm install -g http-server

# Copy the rest of the application
COPY . .

# Expose port 8080
EXPOSE 8080

# Set the PORT environment variable
ENV PORT=8080

# Start http-server on port 8080
CMD ["http-server", ".", "-p", "8080"]
