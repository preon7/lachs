#!/bin/bash
DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
cd "${DIR}"
node ./Lachs-server.js &

until npx nxapi splatnet3 monitor saved_results --coop --update-interval 10; do
    echo monitor encountered an error, restarting
done
