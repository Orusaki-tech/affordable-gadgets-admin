FROM nginx:alpine
COPY inventory-management-frontend/build /usr/share/nginx/html
COPY inventory-management-frontend/nginx-spa.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
