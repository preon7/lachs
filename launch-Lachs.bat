@echo off

call node check_update.js

start /b "" call "start_monitor.bat"
start /b "" call "start_server.bat"

cmd /k