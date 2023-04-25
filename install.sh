#!/bin/bash
npm install ejs nxapi body-parser winston
cp tools/na.js node_modules/nxapi/dist/api/na.js
npx nxapi nso auth
npx nxapi splatnet3 user

mkdir -p saved_results

