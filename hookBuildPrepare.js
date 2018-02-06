#!/usr/bin/env node

var fs = require('fs');
var path = require('path');

process.stdout.write('******** IONIC CLI HOOK - hookBuildPrepare.js **************\n');
process.stdout.write("If this step fails: Maybe config.prod.js is missing in root directory - use config.dev.js as template.\n\n");

var exec = require('child_process').exec;
var rev = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
var jsPath;

try {

  var fileContent = "window.appBuildTime='"+rev+"';";
  jsPath = path.join('src','assets', 'js', 'versionInfo.js');
  try {fs.unlinkSync(jsPath);} catch (e) {}
  fs.writeFileSync(jsPath, fileContent, 'utf8');
  process.stdout.write("OK --> file '"+jsPath+"' updated -->\n"+fileContent+"\n");

} catch (e) {
  process.stdout.write("FAIL hookAngularPrepare.js --> ERROR ON WRITING updateVersionInfo.js : "+JSON.stringify(e)+" \n");
}

try {
  fs.createReadStream('./config.prod.js').pipe(fs.createWriteStream('./src/assets/js/config.js'));
  process.stdout.write('OK --> ./src/assets/js/config.js was overwritten with config.prod.js for ionic build\n');
} catch (e) {
  process.stdout.write("FAIL hookBuildPrepare.js --> "+JSON.stringify(e)+" \n");
}
