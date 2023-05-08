// @author Furen https://github.com/preon7
var data = {}
var total_count = {};
var last_count = {};
var file_content;
var targets;
var targetDate;
var defaultDate;
var lastDate;
var currentDangerLevel;
var currentGrade;
var totalRounds = 0;

const express = require('express')
const bodyParser = require('body-parser')
const app = express()
app.set('view engine', 'ejs')

var fs = require('fs');
var url = require('url');

// load enemies
var file_content = fs.readFileSync('resources/enemy_data.json');
const enemyList = JSON.parse(file_content);

// load languages
// var file_content = fs.readFileSync('languages/cn.json');
// const webText = JSON.parse(file_content);
languages = {}

app.use(express.static(__dirname + '/resources'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}))

const logger = require("./logger");

function loadLanguages() {
    var files = fs.readdirSync('languages/');
    for(let i = 0; i < files.length; i ++) {
        var filename = files[i];
        if (filename.slice(-5) == '.json') {
            var file_content = fs.readFileSync('languages/' + filename);
            languages[filename.substring(0,2)] = JSON.parse(file_content);
        }
    }
}

function fetchResult(startDate) {
    var files = fs.readdirSync('saved_results/');
    var out_string = "";
    var filtered_files = [];

    for(let i = 0; i < files.length; i ++) {
        var filename = files[i];
        if (filename.substring(10, 21) == 'coop-result') {
            filtered_files.push(filename);
        }
    }

    filtered_files.sort();

    for (let i = 0; i < filtered_files.length; i ++) {
        // var contentStr = "";
        out_string = out_string + ' <br> ' + filtered_files[i];
        var file_content = fs.readFileSync('saved_results/' + filtered_files[i]);
        file_content = JSON.parse(file_content);
        var enemyData = file_content.result.enemyResults;
        for (var k in enemyData) {
        //     contentStr = contentStr + ' ' + enemyData[k].enemy.name + ': ' + enemyData[k].defeatCount;
            last_count[enemyData[k].enemy.id] = enemyData[k].defeatCount;
        }
        
        // compare with set time
        var workTime = Date.parse(file_content.result.playedTime.slice(0,16));

        var data_key = filtered_files[i];
        // check if file already read
        if ((!data.hasOwnProperty(data_key)) && (Date.parse(startDate) < workTime)) {
            data[data_key] = true;
            logger.debug("Start time: " + startDate + "; Got result at: " + file_content.result.playedTime);
            totalRounds ++;

            try {
                currentDangerLevel = Number(file_content.result.dangerRate) * 100;
                currentGrade = file_content.result.afterGrade.name + " " + file_content.result.afterGradePoint;
            } catch (error) {
                logger.error(error.stack);
                currentDangerLevel = "";
                currentGrade = "";
            }

            for (var k in enemyData) {
                // add to enemy count 
                if (total_count.hasOwnProperty(enemyData[k].enemy.id)) {
                    total_count[enemyData[k].enemy.id] = total_count[enemyData[k].enemy.id] + enemyData[k].defeatCount;
                } else {
                    total_count[enemyData[k].enemy.id] = enemyData[k].defeatCount;
                }
                
            }
        }
    }
}

function subtractHours(date, hours) {
    date = new Date(date);
    date.setHours(date.getHours() - hours);
  
    return date;
}

function loadTargets() {
    if (fs.existsSync('resources/targets.json')) {
        file_content = fs.readFileSync('resources/targets.json');
        targets = JSON.parse(file_content);
        targetDate = targets['date'];
        // logger.debug("read targets from file ");
    } else {
        targets = {};
    }
}

function renderIndex(req, res) {
    loadLanguages();

    lang = 'cn';
    try {
        var code = req.params.locale;
        if(code !== '' && languages.hasOwnProperty(code)) {
            lang = code;
        } else if (!code) {
            lang = 'cn';
        } else {
            lang = 'en';
        }
    } catch (error) {
        lang = 'en';
    }

    var webText = languages[lang];

    var dataArr = [];
    var setArr = [];

    loadTargets();
    
    // add enemy count setting form
    for (var k in enemyList) {
        var defaultValue;
        if (targets.hasOwnProperty(k)) {
            defaultValue = targets[k];
        } else {
            defaultValue = 0;
        }

        var defaultOffsetValue;
        if (targets.hasOwnProperty(k+'offset')) {
            defaultOffsetValue = targets[k+'offset'];
        } else {
            defaultOffsetValue = 0;
        }

        setArr.push({
            name: k,
            eid: k,
            url: enemyList[k].url,
            default: defaultValue,
            default_check: ((targets[k+"check"]) ?  "checked" : ""),
            default_offset: defaultOffsetValue,
        });
    }
    
    if (targetDate) {
        defaultDate = targetDate;
    } else {
        defaultDate = "2023-04-11T00:00";
    }

    lastDate = defaultDate;

    // logger.info((targets['roundSwitch']) ?  "checked" : "")
    // logger.info(JSON.stringify(targets))
    var optionsDefault = {
        displayRoundDefault: (targets['roundSwitch']) ?  "checked" : "",
        displayLastDefault: (targets['lastSwitch']) ?  "checked" : "",
        displayRankDefault: (targets['rankSwitch']) ?  "checked" : ""
    };
    
    res.render("index", {
        defaultDate: defaultDate,
        // level: currentDangerLevel,
        // grade: currentGrade,
        dataArr: dataArr,
        setArr: setArr,
        optionsDefault: optionsDefault,
        refresh: false,
        webText: webText
    })
}

app.get("/", renderIndex)
app.get("/:locale", renderIndex)
    
app.post("/", (req, res) => {
    var enemyCounts = req.body;
    targetDate = req.body.startTime;
    targets = enemyCounts;
    targets['date'] = targetDate;
    // reset count after new request
    if (!(lastDate == targetDate)) {
        logger.debug('count date changed from ' + lastDate + ' to ' + targetDate);
        data = {};
        total_count = {};
        totalRounds = 0;
    }

    // convert to GMT
    var isoTime = new Date(targetDate).toISOString().slice(0,16);
    fetchResult(isoTime);
    // logger.debug("target date " + targetDate);
    // logger.debug("iso date " + isoTime);

    var dataArr = [];
    var setArr = [];

    // set display options
    var displayRound = 'hidden';
    var displayLast = 'hidden';
    var displayRank = 'hidden';
    if (enemyCounts['roundSwitch']) {
        displayRound = 'display';
    }
    if (enemyCounts['lastSwitch']) {
        displayLast = 'display';
    }
    if (enemyCounts['rankSwitch']) {
        displayRank = 'display';
    }

    // display form info
    for (var k in enemyCounts) {
        if (!enemyList.hasOwnProperty(k)) {continue;}
        // if (k == "startTime") {continue;}
        // logger.debug(k.slice(-5));
        // if (k.slice(-5) == 'check') { continue; }

        // targets[k] = enemyCounts[k];
        var count_display = ((total_count[k]) ?  total_count[k] : 0);

        if (enemyCounts['mode'] == 1) {
            if (!enemyCounts[k + 'check']) { continue; }
            
        } else if (enemyCounts['mode'] == 2) {
            if (Number(enemyCounts[k]) <= 0) { continue; }
            count_display = count_display + '/' + enemyCounts[k];
        } else if (enemyCounts['mode'] == 3) {
            if (Number(enemyCounts[k+'offset']) <= 0) { continue; }
            count_display = Number(count_display) + Number(enemyCounts[k+'offset']);
        }

        if (displayLast == 'display') {
            count_display = count_display + '(' + last_count[k] + ')';
        }
        
        // if (enemyList.hasOwnProperty(k)) {
            // logger.debug(enemyCounts[k]);
        dataArr.push({
            eid: k,
            content: count_display,
            url: enemyList[k].url
        });
        // }
    }

    // save form input this time
    fs.writeFile("resources/targets.json", JSON.stringify(targets), function(err) {
        if (err) {
            logger.error(err.stack);
        }
    });

    lastDate = targetDate;
    var displayOptions = {
        displayRound: displayRound,
        displayLast: displayLast,
        displayRank: displayRank,
    };
    var displayInfo = {
        totalRounds: totalRounds,
        level: currentDangerLevel,
        grade: currentGrade,
    };

    res.render("index", {
        defaultDate: defaultDate,
        dataArr: dataArr,
        setArr: setArr,
        displayOptions: displayOptions,
        displayInfo: displayInfo,
        refresh: true,
        webText: languages['cn']
    })
})
  
app.listen(8001, (req, res) => {
    logger.info('Display server is running on localhost:8001, copy this address to OBS.');
    logger.info('启动后台显示服务器，复制地址 localhost:8001 到OBS');
})

// error handler
app.use(function (err, req, res, next) {
    logger.error(err.stack);
    res.status(500).send('Got an error. Check console output or contact author with log file at ' + 'resources/latest_run.log');
})