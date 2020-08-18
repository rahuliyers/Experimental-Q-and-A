var fs = require('fs');
var readline = require('readline');
var stream = require ('stream');
var mkdirp = require('mkdirp');
var sortedSmallPath = '../cowgleData/sortedSmall.txt';
var totalLines = 0;

function createResourcesAndIndex(){
    console.log("Creating index:");
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
    var rrv = {};
//     var testCounter = 0;
    rl.on('line',function(line){
// 	    console.log('here');
        var tokens = line.split("\t|\t");
        var resource = tokens[0].trim();
        var relationship = tokens[1].trim();
        var value = tokens[2].trim();
        if(resource!==lastResource){
	        if(lastResource===""){
		        //We don't need to do anything with the previous one. Just ignore it.
	        }else{
// 		        testCounter++;
		        //First get the finalpath where actual resource file should be
		        var cln = searchableResourceFromRaw(lastResource);
		        var pth = getPathForResource(cln);
				//Generate the hash for the name of the file
		        var filename = hashString(cln)+ '.json';
		        var cmpFlPth = pth + filename;
		        
		        //Check if file exists, if it does, add it to the resources
		        var file;
		        if(fs.existsSync(cmpFlPth)){
			        file = JSON.parse(fs.readFileSync(cmpFlPth));
			        fs.unlinkSync(cmpFlPth);
			         //Delete the old file, write the updated / new one to disk
		        }else{
			        //If it doesnt, then create it
			        file = {};
		        }
		        file[cln] = rrv;
		        fs.writeFileSync(cmpFlPth,JSON.stringify(file));
// 		        console.log("Creating: " + cmpFlPth);
            	//write the file to disk, 
            	
            	//Get each of the index after the first two 
//             	console.log("pth: " + pth);
            	var pthTokens = pth.split("/");
            	for(var i=3; i<pthTokens.length;i++){
	            	var indexPath="";
	            	for(var j=0;j<=i;j++){
		            	indexPath+=pthTokens[j]+"/";
	            	}
	            	indexPath+="index.json";
	            	
	            	var idxFile;
	            	if(fs.existsSync(indexPath)){
		            	idxFile = JSON.parse(fs.readFileSync(indexPath));
						fs.unlinkSync(indexPath);
	            	}else{
		            	idxFile = {};
		            	idxFile['s'] = [];//clean resource suggestions
	            	}
	            	
	            	idxFile['s'].push(cln);
	            	fs.writeFileSync(indexPath,JSON.stringify(idxFile));
// 	            	console.log("Creating: " + indexPath);
	            	//Put the resource name (clean calculatable) in the indexes.
					//and add it to the index at the expected locations 3-end
            	}

	        }
	        
            lastResource = resource;
            
            //create the new object and relationships
			rrv = {};
			addToExistinObject("cowgleId",searchableResourceFromRaw(resource),rrv);
            addToExistinObject(relationship,value,rrv);
/*
			console.log("mere");
            console.log(JSON.stringify(rrv,null,3));
*/
        }else{
	        //add to existing object and relationships
	        addToExistinObject(relationship,value,rrv);
/*
	        console.log("there");
	        console.log(JSON.stringify(rrv,null,3));
*/
        }
        totalLines++;
        if(totalLines%100000===0){
	        console.log("Completed reading: " + totalLines);
        }
/*
        if(testCounter>=2){
	        console.log("text over");
	        rl.close();
	        process.exit();
        }
*/
    }).on('close',function(){
	    console.log("Finished creating resources and index");
//         makeDirectoriesFile();
    });
}

//If you change this, remember makeTrie
function searchableResourceFromRaw(rawResource){
	var searchable = decodeURIComponent(rawResource);
	searchable = searchable.split("_").join(" ").toLowerCase();
    return searchable;
}

//If you change this, remember makeTrie. Remember to pass in a searchable resource for the path
function getPathForResource(resource){ 
    var path = "../cowgleData/data/";
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

//If you change this, remember makeTrie
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

function addToExistinObject(relationship,value,rrv){
    var relArr;
    if(relationship in rrv){
        relArr = rrv[relationship];
    }else{
        rrv[relationship] = [];
        relArr = rrv[relationship];
    }
    
    relArr.push(value); // this hasn't been cleaned.
}

function hashString(string) {
  var hash = 0, i, chr, len;
  if (string.length == 0) return hash;
  for (i = 0, len = string.length; i < len; i++) {
    chr   = string.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  hash = Math.abs(hash);
  return hash;
};

createResourcesAndIndex();