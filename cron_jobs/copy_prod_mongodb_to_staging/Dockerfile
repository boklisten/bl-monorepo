FROM alpine:latest

RUN apk add --no-cache mongodb-tools

COPY dump_and_restore.sh /

CMD ["sh", "/dump_and_restore.sh"]
