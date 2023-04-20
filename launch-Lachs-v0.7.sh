#!/bin/bash
node Lachs-server.js &

until npx nxapi splatnet3 monitor saved_results --update-interval 10; do
    echo monitor encountered an error, restarting
done
