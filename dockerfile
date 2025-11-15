# ---------- Stage 1: copy static files ----------
    FROM nginx:latest

    # Удаляем дефолтный nginx конфиг
    RUN rm /etc/nginx/conf.d/default.conf
    
    # Наш конфиг
    COPY nginx.conf /etc/nginx/conf.d/default.conf
    
    # Кладём статические файлы
    COPY . /usr/share/nginx/html
    
    EXPOSE 80
    
    CMD ["nginx", "-g", "daemon off;"]