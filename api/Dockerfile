FROM golang:1.13.8 AS build-env
MAINTAINER gxthrj@163.com

WORKDIR /go/src/github.com/api7/api7-manager-api
COPY . .
RUN mkdir /root/api7-manager-api \
    && go env -w GOPROXY=https://goproxy.io,direct \
    && export GOPROXY=https://goproxy.io \
    && go build -o /root/api7-manager-api/api7-manager-api \
    && mv /go/src/github.com/api7/api7-manager-api/build.sh /root/api7-manager-api/ \
    && mv /go/src/github.com/api7/api7-manager-api/conf.json /root/api7-manager-api/ \
    && rm -rf /go/src/github.com/api7/api7-manager-api \
    && rm -rf /etc/localtime \
    && ln -s  /usr/share/zoneinfo/Hongkong /etc/localtime \
    && dpkg-reconfigure -f noninteractive tzdata

FROM alpine:3.11
MAINTAINER gxthrj@163.com

RUN mkdir /root/api7-manager-api \
   && apk update  \
   && apk add ca-certificates \
   && update-ca-certificates \
   && apk add --no-cache libc6-compat \
   && echo "hosts: files dns" > /etc/nsswitch.conf \
   && rm -rf /var/cache/apk/*


WORKDIR /root/api7-manager-api
COPY --from=build-env /root/api7-manager-api/* /root/api7-manager-api/
COPY --from=build-env /usr/share/zoneinfo/Hongkong /etc/localtime
EXPOSE 8080
RUN chmod +x ./build.sh
CMD ["/root/api7-manager-api/build.sh"]
