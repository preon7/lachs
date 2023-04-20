#!/bin/bash
npm install ejs nxapi body-parser winston
npx nxapi nso auth
npx nxapi splatnet3 user

mkdir -p saved_results

