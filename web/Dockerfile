FROM node:14-alpine as fe-builder

ARG ENABLE_PROXY=true

WORKDIR /usr/local/apisix-dashboard

COPY . /usr/local/apisix-dashboard/web

WORKDIR /usr/local/apisix-dashboard/web

RUN if [ "$ENABLE_PROXY" = "true" ] ; then yarn config set registry https://registry.npm.taobao.org/ ; fi

RUN yarn install

RUN yarn build

FROM nginx:alpine

WORKDIR  /usr/local/apisix-dashboard

COPY --from=fe-builder /usr/local/apisix-dashboard/output/html /usr/local/apisix-dashboard

ADD nginx.conf /etc/nginx/

EXPOSE 9000

CMD ["sh","-c","nginx && tail -f /dev/null"]
STOPSIGNAL SIGQUIT