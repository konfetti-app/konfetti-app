#!/usr/bin/env node

var fs = require('fs');
var path = require('path');

process.stdout.write('******** IONIC CLI HOOK - updateVersionInfo.js **************\n');

var exec = require('child_process').exec;
var rev = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');

try {

  var fileContent = "window.appBuildTime='"+rev+"';";
  var jsPath = path.join('src','assets', 'js', 'versionInfo.js');
  try {fs.unlinkSync(jsPath);} catch (e) {}
  fs.writeFileSync(jsPath, fileContent, 'utf8');
  process.stdout.write("OK file '"+jsPath+"' updated -->\n"+fileContent+"\n");

} catch (e) {
  process.stdout.write("BEFORE BUILD HOOK --> ERROR ON WRITING updateVersionInfo.js : "+JSON.stringify(e)+" \n");
}

/*
exec('svn info', function(error, stdout, stderr) {



  /*
   *  ******** TRY TO GET LATEST SVN VERSION NUMBER **********
   *  --> make sure that command 'svn' is working on command line
  try {
    var start = stdout.indexOf("Revision:");
    if (start>0) {

      var end = stdout.indexOf("\n",start);
      start = start+10;
      rev = stdout.substr(start, end-start);
      process.stdout.write("REVISION IS #"+rev+"#\n");
    } else {
      process.stdout.write("NO REVISION INFO FOUND: "+stdout+"\n");
    }
  } catch (e) {
      process.stdout.write("BEFORE BUILD HOOK --> ERROR ON GETTING SVN REVISION : "+JSON.stringify(e)+" \n");
  }
   */

  /*
   *  ******** WRITE SVN VERSION NUMBER **********




});
*/
