FROM eclipse-temurin:11-jre-alpine

RUN mkdir -p /opt/routr && apk add --no-cache --update tini
WORKDIR /opt/routr

COPY ./libs /opt/routr/libs
COPY ./requester.sh /opt/routr

RUN chmod +x /opt/routr/requester.sh

# Re-mapping the signal from 143 to 0
ENTRYPOINT ["tini", "-v", "-e", "143", "--"]
CMD ["/opt/routr/requester.sh"]
