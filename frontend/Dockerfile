# Stage 1: Build
FROM node:18-alpine as build-stage

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
# Ensure VITE_API_URL is available during build if needed
# But for Nginx proxy, we handle /api in nginx.conf
RUN npm run build

# Stage 2: Serve
FROM nginx:stable-alpine as production-stage

# Copy build output
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
