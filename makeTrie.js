var fs = require('fs');
var readline = require('readline');
var stream = require ('stream');
var mkdirp = require('mkdirp');
var sortedSmallPath = '../Data/sortedSmall.txt';
var resources = [];
var totalLines = 0;

function loadResources(){
    console.log("Loading resources into memory.");
    //First load all the resources into memory.
    var instream = fs.createReadStream(sortedSmallPath);
	var outstream = new stream;
	outstream.readable = true;
	outstream.writable = true;

    var rl = readline.createInterface({
        input: instream,
        output: outstream,
        terminal: false
    });

    var lastResource = "";
    rl.on('line',function(line){
        var tokens = line.split("\t|\t");
        var resource = tokens[0].trim();
        if(resource!==lastResource){
            lastResource = resource;
            resources.push(searchableResourceFromRaw(resource));
        }
        totalLines++;
    }).on('close',function(){
        makeDirectoriesFile();
    });
}

function makeDirectoriesFile(){
    console.log("Making directories :" + resources.length);
    var root = "trie/";
    var directoriesFile = "../Data/directoryList.txt";
    for(var i=0;i<resources.length;i++){
        var currentResource = resources[i];
        var currentPath = getPathForResource(currentResource);
        fs.appendFileSync(directoriesFile,currentPath+'\n');
        if(i%100000===0){
	        console.log("Completed adding " + i + "/" +resources.length + " to directories file.");
        }
    }
}

function searchableResourceFromRaw(rawResource){
	var searchable = decodeURIComponent(rawResource);
	searchable = searchable.split("_").join(" ").toLowerCase();
    return searchable;
}

function getPathForResource(resource){
    var path = "../Data/data/";
    var chunks = 0;
    for(var i=0;i<resource.length;i++){
        var c = resource.charAt(i);
        if(isAlphaNumeric(c)){
        	path+=c+"/";
        	chunks++;
        }else{
            if(i===0){
                path+="other"+"/";
                chunks++;
            }
        }
        if(chunks>=6){
	        break;
        }
    }
    return path;
}

function isAlphaNumeric(str) {
  var code, i, len;

  for (i = 0, len = str.length; i < len; i++) {
    code = str.charCodeAt(i);
    if (!(code > 47 && code < 58) && // numeric (0-9)
        !(code > 64 && code < 91) && // upper alpha (A-Z)
        !(code > 96 && code < 123)) { // lower alpha (a-z)
      return false;
    }
  }
  return true;
}

loadResources();
