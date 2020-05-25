FROM nginx:alpine

COPY dist/ /emberclear
COPY scripts/docker/run-nginx.sh /usr/local/bin
COPY scripts/docker/nginx.conf etc/nginx/conf.d/default.conf.template

EXPOSE 4201
CMD ["/usr/local/bin/run-nginx.sh"]


