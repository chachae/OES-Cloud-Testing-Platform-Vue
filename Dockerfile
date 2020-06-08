FROM nginx:1.14.2
MAINTAINER chachae chachae@foxmail.com

COPY nginx.conf /etc/nginx/nginx.conf
COPY dist/ /etc/nginx/html
