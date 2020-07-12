# phase-build
FROM circleci/node:latest-browsers as builder

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
