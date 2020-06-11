FROM golang:1.13.8 AS build-env

WORKDIR /go/src/github.com/apisix/manager-api
COPY . .
RUN mkdir /root/manager-api \
    && go env -w GOPROXY=https://goproxy.io,direct \
    && export GOPROXY=https://goproxy.io \
    && go build -o /root/manager-api/manager-api \
    && mv /go/src/github.com/apisix/manager-api/build.sh /root/manager-api/ \
    && mv /go/src/github.com/apisix/manager-api/conf.json /root/manager-api/ \
    && rm -rf /go/src/github.com/apisix/manager-api \
    && rm -rf /etc/localtime \
    && ln -s  /usr/share/zoneinfo/Hongkong /etc/localtime \
    && dpkg-reconfigure -f noninteractive tzdata

FROM alpine:3.11

RUN mkdir /root/manager-api \
   && apk update  \
   && apk add ca-certificates \
   && update-ca-certificates \
   && apk add --no-cache libc6-compat \
   && echo "hosts: files dns" > /etc/nsswitch.conf \
   && rm -rf /var/cache/apk/*


WORKDIR /root/manager-api
COPY --from=build-env /root/manager-api/* /root/manager-api/
COPY --from=build-env /usr/share/zoneinfo/Hongkong /etc/localtime
EXPOSE 8080
RUN chmod +x ./build.sh
CMD ["/root/manager-api/build.sh"]
