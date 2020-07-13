# phase-build
FROM node:12-alpine as builder

RUN apk --no-cache add g++ gcc libgcc libstdc++ linux-headers make python

WORKDIR /usr/src/app/
USER root

COPY package.json ./
COPY yarn.lock ./
RUN yarn

COPY ./ ./
RUN yarn build && rm -rf /usr/src/app/node_modules

# phase-run
FROM nginx:1.16-alpine

COPY ./docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html/dashboard

EXPOSE 80
