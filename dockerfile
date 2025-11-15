# --- build stage ---
    FROM node:20 AS build

    WORKDIR /app
    
    COPY package*.json ./
    RUN npm install
    
    COPY . .
    RUN npm run build
    
    # --- run stage ---
    FROM nginx:alpine
    
    COPY --from=build /app/dist /usr/share/nginx/html
    
    EXPOSE 80
    CMD ["nginx", "-g", "daemon off;"]
# End of dockerfile
# This Dockerfile is used to build and run a frontend application using Node.js and Nginx.  
