#!/bin/bash
set -xe
OUTPUT_DIR="$1"
git clone https://github.com/rhashimoto/wa-sqlite.git wa-sqlite
cd wa-sqlite
git checkout a95a244a007c2c10435cb57633ab187e07fdd29f
git apply /wa-sqlite.patch
yarn install
make cache/*
make -j$(($(nproc) + 1)) || make
cp dist/* "${OUTPUT_DIR}/"
bash
