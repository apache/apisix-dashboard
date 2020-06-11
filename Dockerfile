# phase-build
FROM node:12-alpine as builder

WORKDIR /usr/src/app/
USER root

COPY package.json /usr/src/app/
RUN yarn

COPY . /usr/src/app/
RUN yarn build && rm -rf /usr/src/app/node_modules

# phase-run
FROM nginx:1.16-alpine

COPY ./docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html/dashboard

EXPOSE 80
