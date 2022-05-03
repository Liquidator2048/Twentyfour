FROM docker.io/ipfs/go-ipfs AS ipfs
FROM docker.io/emscripten/emsdk:2.0.26
USER root
RUN npm -g install yarn
ADD ./run.sh /run.sh
ADD ./wa-sqlite.patch /wa-sqlite.patch
COPY --from=ipfs /usr/local/bin/ipfs /usr/bin/ipfs
VOLUME /dist
RUN chmod 0755 /run.sh
#RUN set -x && \
#    apt-get update -qq && \
#    apt-get install libsqlite3-dev libvsqlitepp-dev -y && \
#    rm -rf /var/lib/apt/lists/*
