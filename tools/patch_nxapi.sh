#!/bin/bash
DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
cd "${DIR}"

cp ./na.js ../node_modules/nxapi/dist/api/na.js

echo "补丁安装成功 按回车键关闭窗口"
read -p "Patch done. Press enter to continue"
