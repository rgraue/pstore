# !/bin/bash

# install deps
npm ci --production

# build
npm run build

# globally link
npm link pstore
