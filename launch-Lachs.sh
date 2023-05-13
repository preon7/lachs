#!/bin/bash
DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
cd "${DIR}"
# check update
# SELF_VER=$( cat README.md | sed -ne "s/Current-Version: \(.*\)/\1/p" )
# LATEST_VER=$( curl --silent "https://raw.githubusercontent.com/preon7/lachs/main/README.md" | sed -ne "s/Current-Version: \(.*\)/\1/p" )
# if (( $(echo "0.6 < $LATEST_VER" |bc -l) )); then
# echo Found newer version: $LATEST_VER Download link: 
# echo 发现新版本：$LATEST_VER 下载地址：
# echo "1. https://github.com/preon7/lachs/zipball/master"
# echo "2. https://pan.baidu.com/s/1Z3Lo6BBKELzXiFXRkuG8Vg  提取码：fr3q "

# echo 
# curl --silent "https://raw.githubusercontent.com/preon7/lachs/dev/README.md" | awk -v ver=$LATEST_VER+':' -v RS='\n-' '$0~ver'
# else
# echo Launching Lachs $SELF_VER
# fi

# check with js
node check_update.js

# re for paragraph: ## Updates(.|\n)*(- 0.8(.|\n)*)\n-

node ./Lachs-server.js &

# echo Launching Lachs $SELF_VER
until npx nxapi splatnet3 monitor saved_results --coop --update-interval 10; do
    echo monitor encountered an error, restarting
done
