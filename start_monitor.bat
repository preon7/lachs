@echo off
:start
call npx nxapi splatnet3 monitor saved_results --coop --update-interval 10 && (
  echo splatnet 3 monitor success
) || (
  echo monitor encountered an error, restarting
)
goto start
