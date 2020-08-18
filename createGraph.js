var fs = require('fs');
var readline = require('readline');
var stream = require ('stream');
var path = require('path');
var pathSep = path.sep;
var mkdirp = require('mkdirp');


var smallFileLocation = '../cowgleData/sortedSmall.txt';
var resources = require('../cowgleData/resourceIndex.json');
var relationships = require('../cowgleData/relIndex.json');
var lineLimit = 33449631;
var skip;
var limit

function createGraph(){
	console.log("Creating graph");

	if(fs.existsSync('./trie.json')){
		createFrontResourceFiles();
	}else{
		createTrie();
	}
	
	//Figure out total lines
}

function createTrie(){
	for(var prop in resources){
		var lc = prop.toLowerCase();
	}
}

function createTriee(){
	console.log("Creating trie");
	
	var ctr = 0;
	var instream = fs.createReadStream(smallFileLocation);
	var outstream = new stream;
	outstream.readable = true;
	outstream.writable = true;
	
	var rl = readline.createInterface({
	    input: instream,
	    output: outstream,
	    terminal: false
	});
	
	rl.on('line',function(line){
/*
		if(ctr>5000){
			return; //TODO Remove this after testing
		}
*/
		var tokens = line.split("\t|\t");
		var resource = tokens[0].trim();
		resource = decodeURIComponent(resource);
		var relationship = tokens[1].trim();
		var value = tokens[2].trim();
		try{
			value = decodeURIComponent((value.toString().split("_").join(" ")).toLowerCase());
		}catch(f){
// 			console.log("Error decoding value: " + tokens[2].trim() + " .Trying without decoding.");
			value = value.toString().split("_").join(" ").toLowerCase();
		}
		
/*
		if(resource in resources){
			
		}else{
			console.log("ERROR: Some kind of missing resource: " + resource);
			process.exit();
		}
		
		if(relationship in relationships){
			
		}else{
			console.log("ERROR: Some kind of missing relationship: " + relationship);
			process.exit();
		}
*/
		
		if(ctr % 100000 === 0){
			console.log("Read: " + ctr);
		}
		var resourceLowercase;
		try{
			resourceLowercase = decodeURIComponent((resource.toString().split("_").join(" ")).toLowerCase());
		}catch(e){
// 			console.log("Error when decoding resource:" + resource + " .Trying without decoding.");
			resourceLowercase = resource.toString().split("_").join(" ").toLowerCase();
		}
		
		var pth = "data" + path.sep;
		for(var i=0;i<resourceLowercase.length;i++){
			var c = resourceLowercase.charAt(i);
			if(isAlphaNumeric(c)){
				pth +=c + path.sep;
				dirp(pth);
			}else{
				if(i===0){
					pth +='other' + path.sep;
					dirp(pth);
				}
			}			
		}
		
		//TODO need to do something about files which can't have proper name.
		ctr++;
		if(ctr%100000===0){
			console.log("Finished " + ctr + "/" + lineLimit + " of trie..");
		}
		
		if(ctr===lineLimit){
			fs.writeFileSync("./trie.json",JSON.stringify({}));
		}
	}).on('end',function(){
		console.log("Done making trie");
	});
}

function dirp(pth){
	mkdirp(pth,function(e){
		if(e){
			console.log("Error when making file: " + pth + " : " + e);
		}
	});
}

function createFrontResourceFiles(){
	console.log("Creating resource files !");
	var instream = fs.createReadStream(smallFileLocation);
	var outstream = new stream;
	outstream.readable = true;
	outstream.writable = true;

	
	var rl = readline.createInterface({
	    input: instream,
	    output: outstream,
	    terminal: false
	});
	
	var previousPath = "";
	var ctr = 0;
	var current = "";
	var last = "";
	var written = 0;
	var readyToRestart = false;
	rl.on('line', function(line) {
/*
		if(ctr>5000){
			setTimeout(callback, 1000):
			return;
		}
*/
		var tokens = line.split("\t|\t");
		var resource = tokens[0].trim();
		resource = decodeURIComponent(resource);
		var relationship = tokens[1].trim();
		var value = tokens[2].trim();
		try{
			value = decodeURIComponent((value.toString().split("_").join(" ")).toLowerCase());
		}catch(f){
// 			console.log("Error decoding value: " + tokens[2].trim() + " .Trying without decoding.");
			value = value.toString().split("_").join(" ").toLowerCase();
		}
		
/*
		if(resource in resources){
			
		}else{
			console.log("ERROR: Some kind of missing resource: " + resource);
			process.exit();
		}
		
		if(relationship in relationships){
			
		}else{
			console.log("ERROR: Some kind of missing relationship: " + relationship);
			process.exit();
		}
*/
		
		var resourceLowercase;
		try{
			resourceLowercase = decodeURIComponent((resource.toString().split("_").join(" ")).toLowerCase());
		}catch(e){
// 			console.log("Error when decoding resource:" + resource + " .Trying without decoding.");
			resourceLowercase = resource.toString().split("_").join(" ").toLowerCase();
		}
		var pth = "data" + pathSep;
		for(var i=0;i<resource.length;i++){
			var c = resourceLowercase.charAt(i);
			if(isAlphaNumeric(c)){
				pth +=c + pathSep;

			}else{
				if(i===0){
					pth +='other' + pathSep;
				}
			}			
		}
		pth+='file.json';
		
		if(current === "" || current['cowgleID'] !== resource ){ //Check if this works instead of resourceLowerCase
			if(current === ""){
			}else{
				var thing = JSON.parse(JSON.stringify(current));
				//Write the old one.
				// If file already exists, then it is a weirdly named file, so we add it 
				var pl = previousPath;
				fs.exists(pl,function(exists){
					var file;
					if(exists){
						fs.readFile(pl,function(err,data){
							if(err){
								console.log("When reading file:"+ pl+ " got error:" +err);
							}else{
								file = JSON.parse(data);
								createResource(file,thing,pl,written);
							}
						});
					}else{
						file = {};
						createResource(file,thing,pl,written);
					}
				});
				
			}
			
			current = {};
			current['cowgleID'] = resource;//Check if this works instead of resourceLowerCase
		}
		
		var relArray;
		if(relationship in current){
			relArray = current[relationship];
		}else{
			current[relationship] = [];
			relArray = current[relationship];
		}
		relArray.push(value);
	    ctr++;

/*
	    if(written>=100){
		    fs.writeFileSync("./ready.txt"," ");
		    process.exit();
	    }
*/

		if(ctr%100000===0){
			console.log("Finished " + ctr + "/" + lineLimit + " of resource files..");
		}
	    
	    previousPath = pth;
	    if(ctr===33449630){
			console.log("Finished reading exiting so can be restarted with less memory.");
			fs.writeFileSync("./ready.txt"," ");
			process.exit();
		}
	}).on('end', function(){
		rl.close();
		callback();
	});
}

function createResource(file,thing,previousPath,written){
	var arr;
	var dl = previousPath.split(pathSep);
	var dr = "";
	for(var i=0; i<dl.length-1; i++){
		dr+=dl[i]+pathSep;
	}
	 
	if('array' in file){
		arr = file['array'];
	}else{
		file['array'] = [];
		arr = file['array'];
	}
	arr.push(thing);
	mkdirp(dr,function(e){
		if(e){
			console.log("Error when making directory: " + dr + " : " + e);
		}else{
			writeFileWhenParentDirectoryExists(dr,previousPath,file,500);
		}
	});
}

function writeFileWhenParentDirectoryExists(parentDir,filePath,fileContents,time){
	fs.exists(parentDir,function(exists){
		if(exists){
			fs.writeFile(filePath,JSON.stringify(fileContents,null,3),function(err){
				if(err){
					console.log("When driting file:"+ filePath+ " to parend dir: " + parentDir+ " got error:" +err);
// 				setTimeout(writeFileWhenParentDirectoryExists(parentDir,filePath,fileContents), time*2);

				}
			});
		}else{
			setTimeout(writeFileWhenParentDirectoryExists(parentDir,filePath,fileContents), time*2);
		}
	});
}

/*
function createIndices(startDir,level,nextCall()){
	var files = fs.readdirSync(startDir);
	int filesRead = 0;
	for(var j=0; j<files.lengthl j++){
		var file = files[i];
		if(fs.lstat(file).isDirectory()){
			
		}
	}
}
*/

/*
function createGraph(){
	console.log("Creating graph");
	pathSep = path.sep;

	var instream = fs.createReadStream(smallFileLocation);
	var outstream = new stream;
	outstream.readable = true;
	outstream.writable = true;
	
	var rl = readline.createInterface({
	    input: instream,
	    output: outstream,
	    terminal: false
	});
	
	var previousPath = "";
	var ctr = 0;
	var current = "";
	var last = "";
	var written = 0;
	rl.on('line', function(line) {
		var tokens = line.split("\t|\t");
		var resource = tokens[0].trim();
		resource = decodeURIComponent(resource);
		var relationship = tokens[1].trim();
		var value = tokens[2].trim();
		try{
			value = decodeURIComponent((value.toString().split("_").join(" ")).toLowerCase());
		}catch(f){
			console.log("Error decoding value: " + tokens[2].trim() + " .Trying without decoding.");
			value = value.toString().split("_").join(" ").toLowerCase();
		}
		
		if(resource in resources){
			
		}else{
			console.log("ERROR: Some kind of missing resource: " + resource);
			process.exit();
		}
		
		if(relationship in relationships){
			
		}else{
			console.log("ERROR: Some kind of missing relationship: " + relationship);
			process.exit();
		}
		
		if(ctr % 100000 === 0){
			console.log("Read: " + ctr);
		}
		var resourceLowercase;
		try{
			resourceLowercase = decodeURIComponent((resource.toString().split("_").join(" ")).toLowerCase());
		}catch(e){
			console.log("Error when decoding resource:" + resource + " .Trying without decoding.");
			resourceLowercase = resource.toString().split("_").join(" ").toLowerCase();
		}
		var pth = "data" + pathSep;
		for(var i=0;i<resource.length;i++){
			var c = resourceLowercase.charAt(i);
			if(isAlphaNumeric(c)){
				pth +=c + pathSep;
				mkdir(pth);
				if(i>=2){
					var pd = pth+'index.txt';
					if(!fs.existsSync(pd)){
						var empty = {};
						fs.writeFileSync(pd,JSON.stringify(empty,null,3));
					}
					
					var data = fs.readFileSync(pd);
					var file = JSON.parse(data);
					file[resourceLowercase] = " ";
					fs.unlinkSync(pd);
					fs.writeFileSync(pd, JSON.stringify(file,null,3));
				}
			}else{
				if(i===0){
					pth +='other' + pathSep;
				}
			}			
		}
		
		//TODO need to do something about files which can't have proper name.
		mkdir(pth);
		pth+='file.json';
		
		if(current === "" || current['cowgleID'] !== resource ){ //Check if this works instead of resourceLowerCase
			if(current === ""){
				current = {};
			}else{
				//Write the old one.
				// If file already exists, then it is a weirdly named file, so we add it 
				if(!fs.existsSync(previousPath)){
					var file = {};
					fs.writeFileSync(previousPath,JSON.stringify(file,null,3));
				}
// 				console.log("Reading: "+previousPath);
				var data = fs.readFileSync(previousPath);
				var file = JSON.parse(data);
				var arr;
				if('array' in file){
					arr = file['array'];
				}else{
					file['array'] = [];
					arr = file['array'];
				}
				arr.push(current);
				fs.unlinkSync(previousPath);
				fs.writeFileSync(previousPath, JSON.stringify(file,null,3));
				written++;
				
				current = {};
			}
			
			current['cowgleID'] = resource;//Check if this works instead of resourceLowerCase
		}
		
		var relArray;
		if(relationship in current){
			relArray = current[relationship];
		}else{
			current[relationship] = [];
			relArray = current[relationship];
		}
		relArray.push(value);
		
	    ctr++;

	    if(written>=100){
		    fs.writeFileSync("./ready.txt"," ");
		    process.exit();
	    }
	    
	    previousPath = pth;
	    
	    if(ctr===33449630){
			console.log("Finished reading exiting so can be restarted with less memory.");
			fs.writeFileSync("./ready.txt"," ");
			process.exit();
		}
	}).on('end', function(){

	});
}
*/
 
/*
function mkdir(path, root) {

    var dirs = path.split(pathSep), dir = dirs.shift(), root = (root||'')+dir+pathSep;

    try { fs.mkdirSync(root); }
    catch (e) {
        //dir wasn't made, something went wrong
        if(!fs.statSync(root).isDirectory()) throw new Error(e);
    }

    return !dirs.length||mkdir(dirs.join('/'), root);
}
*/

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
};

exports.createGraph = createGraph;