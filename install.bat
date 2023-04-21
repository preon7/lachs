@echo off
if not exist "saved_results\" mkdir "saved_results\"
call npm install ejs nxapi body-parser winston
copy "tools\na.js" "node_modules\nxapi\dist\api\na.js"
call npx nxapi nso auth
call npx nxapi splatnet3 user
pause
