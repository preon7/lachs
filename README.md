Lachs - Live Assistant for Counting Head in Splatoon3
===

Local web server for displaying and updating salmonid boss count in Salmon Run of Splatoon 3.

The live counting can be checked with browser or [OBS](https://obsproject.com/) (browser source).

Use Node.js as local backend and [nxapi](https://github.com/samuelthomas2774/nxapi) for fetching results.

## Usage
First, install Node.js (installer can be found on [official website](https://nodejs.org/en))

1. Windows:
    Run install.bat by double clicking, and follow the instructions to authorize nxapi.
    If successful, the user info will show on the command window.
    This step only needs to be execute once for each user.
    
    To start monitoring killing counts, double click launch-Lachs-v.07.bat.

2. MacOS / Linux:
    Run install.sh, and follow the instructions to authorize nxapi.
    If successful, the user info will show on the command window.
    This step only needs to be execute once for each user.

    To start monitoring killing counts, double click launch-Lachs-v.07.sh

After starting the monitor script, copy http://localhost:8001 to browser or OBS browser source. 
Then set salmonid boss to monitor on setting panel and click start button to display counting.

The counting icons are arrenged with auto line-break. Adjust display width of OBS browser source 
to control the number of icons on each line.

## License
GPL-3.0