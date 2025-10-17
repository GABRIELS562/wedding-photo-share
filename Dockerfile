# Production Dockerfile for Kirsten & Dale Wedding Photo Share
# Multi-stage build for optimal image size

# Stage 1: Build the application
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies for node-gyp (if needed)
RUN apk add --no-cache python3 make g++

# Copy package files first for better caching
COPY package*.json ./

# Install ALL dependencies (including devDependencies needed for build)
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Build arguments for production build (PUBLIC values only)
ARG VITE_CLOUDINARY_CLOUD_NAME
ARG VITE_CLOUDINARY_UPLOAD_PRESET

# Set environment variables for build
ENV VITE_CLOUDINARY_CLOUD_NAME=${VITE_CLOUDINARY_CLOUD_NAME}
ENV VITE_CLOUDINARY_UPLOAD_PRESET=${VITE_CLOUDINARY_UPLOAD_PRESET}
ENV NODE_ENV=production

# Note: API_KEY and API_SECRET removed - will be in backend only

# Build the application
RUN npm run build

# Stage 2: Production server
FROM nginx:alpine

# Install additional tools
RUN apk add --no-cache curl

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Create directory for SSL certificates (if using Let's Encrypt)
RUN mkdir -p /etc/nginx/ssl

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/ || exit 1

# Expose port 3001 for wedding photo app
EXPOSE 3001

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]