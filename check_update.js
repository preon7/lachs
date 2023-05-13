// var url = "https://raw.githubusercontent.com/preon7/lachs/main/README.md"  // may not work for cn mainland user
var url = "https://pastebin.com/raw/dDBGCc80"
var storedText;

var fs = require('fs');

fetch(url)
  .then(function(response) {
    response.text().then(function(text) {
      storedText = text;
      // console.log(text)
      let latestVer = text.match("Current-Version: (.*)")[1]
      //  getGroup(/Current-Version: (.*)/g, text, 1)[0];
      // console.log(Number(latestVer));
      
      let file_content = fs.readFileSync('README.md', 'utf8');
      // console.log(file_content);
      let currentVer = file_content.match("Current-Version: (.*)")[1]
      // getGroup(/Current-Version: (.*)/g, file_content, 1)[0];
      // console.log(Number(currentVer));

      if (Number(latestVer) > Number(currentVer)) {
        console.log("Found newer version: " + latestVer + " Download link: ");
        console.log("发现新版本：" + latestVer + "下载地址：");
        console.log("1. https://github.com/preon7/lachs/zipball/master");
        console.log("2. https://pan.baidu.com/s/1Z3Lo6BBKELzXiFXRkuG8Vg  提取码：fr3q");
        console.log("")
        console.log(getGroup("## Updates(.|\n|\r)*(- " + latestVer + "(.|\n|\r)*)- [0-9]", text, 2)[0])
        // console.log(getGroup(latestVer + "(.|\n|\r)*", text, 0)[0])
      } else {
        console.log("Launching Lachs " + currentVer);
      }
      
    });
  });

function getGroup(regexp, str, groupIndex=1) {
  const array = [...str.matchAll(regexp)];
  return array.map(m => m[groupIndex]);
}
