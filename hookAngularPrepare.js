#!/usr/bin/env node

var fs = require('fs');
var path = require('path');

// see package.json for hook configuration
process.stdout.write('******** IONIC CLI HOOK - hookAngularPrepare.js **************\n');

var exec = require('child_process').exec;
var rev = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');

// write the versionInfo.js with the latest build time
try {
  var fileContent = "window.appBuildTime='"+rev+"';";
  var jsPath = path.join('src','assets', 'js', 'versionInfo.js');
  try {fs.unlinkSync(jsPath);} catch (e) {}
  fs.writeFileSync(jsPath, fileContent, 'utf8');
  process.stdout.write("OK --> file '"+jsPath+"' updated -->\n"+fileContent+"\n");
} catch (e) {
  process.stdout.write("FAIL hookAngularPrepare.js --> ERROR ON WRITING updateVersionInfo.js : "+JSON.stringify(e)+" \n");
}

// write the config.dev.js from root to the app assets
try {
  fs.createReadStream('./config.dev.js').pipe(fs.createWriteStream('./src/assets/js/config.js'));
  process.stdout.write('OK --> file /src/assets/js/config.js updated from config.dev.js\n');
} catch (e) {
  process.stdout.write("FAIL hookAngularPrepare.js --> "+JSON.stringify(e)+" \n");
}