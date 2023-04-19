@echo off
if not exist "saved_results\" mkdir "saved_results\"
call npm install ejs nxapi body-parser
call npx nxapi nso auth
call npx nxapi splatnet3 user
pause
