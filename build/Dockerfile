FROM docker.io/ipfs/go-ipfs AS ipfs
FROM docker.io/emscripten/emsdk:2.0.26
USER root
RUN npm -g install yarn
COPY --from=ipfs /usr/local/bin/ipfs /usr/bin/ipfs
VOLUME /dist
RUN set -x && \
    apt-get update -qq && \
    apt-get install libsqlite3-dev libvsqlitepp-dev unzip -y && \
    rm -rf /var/lib/apt/lists/*
