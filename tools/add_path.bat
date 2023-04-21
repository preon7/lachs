@echo off
echo "Paste Node.js install path here and press Enter. e.g. C:\Program Files\nodejs\"
set /p nodejs_path=""
SET "PATH=%PATH%;%nodejs_path%"

echo "current system path variable:"
echo %Path%
pause