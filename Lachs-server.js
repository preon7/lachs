// @author Furen https://github.com/preon7
var data = {}
var total_count = {};
var file_content;
var targets;
var targetDate;
var defaultDate;
var lastDate;
var currentDangerLevel;
var currentGrade;

const express = require('express')
const bodyParser = require('body-parser')
const app = express()
app.set('view engine', 'ejs')

var fs = require('fs');

// load enemies
var file_content = fs.readFileSync('resources/enemy_data.json');
const enemyList = JSON.parse(file_content);

app.use(express.static(__dirname + '/resources'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}))

const logger = require("./logger");

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
        var contentStr = "";
        out_string = out_string + ' <br> ' + filtered_files[i];
        var file_content = fs.readFileSync('saved_results/' + filtered_files[i]);
        file_content = JSON.parse(file_content);
        var enemyData = file_content.result.enemyResults;
        for (var k in enemyData) {
            contentStr = contentStr + ' ' + enemyData[k].enemy.name + ': ' + enemyData[k].defeatCount;
        }
        
        // compare with set time
        var workTime = Date.parse(file_content.result.playedTime.slice(0,16));

        var data_key = filtered_files[i];
        // check if file already read
        if ((!data.hasOwnProperty(data_key)) && (Date.parse(startDate) < workTime)) {
            data[data_key] = true;
            logger.debug("Start time: " + startDate + "; Got result at: " + file_content.result.playedTime);

            // currentDangerLevel = Number(file_content.result.dangerRate) * 100;
            // currentGrade = file_content.result.afterGrade.name + " " + file_content.result.afterGradePoint;

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

app.get("/", (req, res) => {
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
        setArr.push({
            name: k,
            eid: k,
            url: enemyList[k].url,
            default: defaultValue,
            default_check: ((targets[k+"check"]) ?  "checked" : "")
        });
    }
    
    if (targetDate) {
        defaultDate = targetDate;
    } else {
        defaultDate = "2023-04-11T00:00";
    }

    lastDate = defaultDate;
    
    res.render("index", {
        defaultDate: defaultDate,
        // level: currentDangerLevel,
        // grade: currentGrade,
        dataArr: dataArr,
        setArr: setArr,
        refresh: false
    })
})
    
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
    }

    // convert to GMT
    var isoTime = new Date(targetDate).toISOString().slice(0,16);
    fetchResult(isoTime);
    // logger.debug("target date " + targetDate);
    // logger.debug("iso date " + isoTime);

    var dataArr = [];
    var setArr = [];

    // display form info
    for (var k in enemyCounts) {
        if (k == "startTime") {continue;}
        // logger.debug(k.slice(-5));
        // if (k.slice(-5) == 'check') { continue; }

        // targets[k] = enemyCounts[k];
        var contentString = ((total_count[k]) ?  total_count[k] : 0);

        if (enemyCounts.only_count) {
            if (!enemyCounts[k + 'check']) { continue; }
            
        } else {
            if (Number(enemyCounts[k]) <= 0) { continue; }
            contentString = contentString + '/' + enemyCounts[k];
        }
        
        if (enemyList.hasOwnProperty(k)) {
            // logger.debug(enemyCounts[k]);
            dataArr.push({
                eid: k,
                content: contentString,
                url: enemyList[k].url
            });
        }
    }

    // save form input this time
    fs.writeFile("resources/targets.json", JSON.stringify(targets), function(err) {
        if (err) {
            logger.error(err.stack);
        }
    });

    lastDate = targetDate;

    res.render("index", {
        defaultDate: defaultDate,
        dataArr: dataArr,
        setArr: setArr,
        // level: currentDangerLevel,
        // grade: currentGrade,
        refresh: true
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