# Stage 1: Compilation environment
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Minimalist serving runtime
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Include standard routing fallbacks inside custom nginx configs if needed
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]