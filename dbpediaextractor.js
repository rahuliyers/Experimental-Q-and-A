var fs = require('fs');
var readline = require('readline');
var stream = require ('stream');

var sourceMappingFileLocation = '../Data/mappingbased_properties_en.nt';

function createFiles(){
	var filenames = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','0','1','2','3','4','5','6','7','8','9','0','other'];
	for(var i=0; i<filenames.length;i++){
		var filename = './'+filenames[i]+'.json';
		fs.writeFileSync(filename, "");
	}
}

function begin(){
	logm("Starting.");
	if(!fs.existsSync('../Data/small.txt')){
		var foo = "";
		console.log("creating file small.txt");
		fs.writeFileSync('../Data/small.txt',foo);
	}
// 	createFiles();
	var instream = fs.createReadStream(sourceMappingFileLocation);
	var outstream = new stream;
	outstream.readable = true;
	outstream.writable = true;

	var rl = readline.createInterface({
	    input: instream,
	    output: outstream,
	    terminal: false
	});

	var ctr = 0;
	rl.on('line', function(line) {
		if(ctr === 0){
		}else{
		    var tokens = line.split(">");
		    var firstResult = getEndStringFromDBPediaSingle(tokens[0],0);
		    var secondResult = getEndStringFromDBPediaSingle(tokens[1],1);
		    var remainder = thirdPart(tokens);
		    var thirdResult = getEndStringFromDBPediaSingle(remainder,2);
			if(isValidTriple(firstResult,secondResult,thirdResult)){
				fs.appendFileSync('../Data/small.txt',firstResult.resource + ' \t|\t' + secondResult.resource + '\t|\t' + thirdResult.resource + '\n');
			}
		}

		if(ctr%100000==0){
			console.log("read: " + ctr + " / 33449632");
		}
	    ctr++;
	});
}

/*
function begin(){
	logm("Starting.");
	createFiles();
	var instream = fs.createReadStream(sourceMappingFileLocation);
	var outstream = new stream;
	outstream.readable = true;
	outstream.writable = true;

	var rl = readline.createInterface({
	    input: instream,
	    output: outstream,
	    terminal: false
	});

	var ctr = 0;
	rl.on('line', function(line) {
		if(ctr === 0){
		}else{
		    var tokens = line.split(">");
		    var firstResult = getEndStringFromDBPediaSingle(tokens[0],0);
		    var secondResult = getEndStringFromDBPediaSingle(tokens[1],1);
		    var remainder = thirdPart(tokens);
		    var thirdResult = getEndStringFromDBPediaSingle(remainder,2);
			if(isValidTriple(firstResult,secondResult,thirdResult)){
				var filename = getFilenameOfTrieForString(firstResult.resource);
				var trie = getTrieForString(firstResult.resource);
				putInTrie(firstResult,secondResult,thirdResult,thirdResult.isResource,false,trie,filename);
			}
		}

		if(ctr%100000==0){
			console.log("read: " + ctr + " / 33449632");
		}
	    ctr++;
	});
}
*/

function getFilenameOfTrieForString(string){
	var c = string.charAt(0);
	c = c.toLowerCase();

	var filename;
	if(isAlphaNumeric(c)){
		filename = './'+c+'.json';
	}else{
		filename='./'+'other'+'.json';
	}

	return filename
}

function getTrieForString(string){
	var c = string.charAt(0);
	c = c.toLowerCase();

	var trie;
	var data;
	if(isAlphaNumeric(c)){
		data = fs.readFileSync('./'+c+'.json');
	}else{
		data = fs.readFileSync('./'+'other'+'.json');
	}
	if(data.length===0){
		data = "{}";
	}

	trie = JSON.parse(data);
	return trie;
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
};

function isValidTriple(first,second,third){
	if(typeof first === 'undefined' || typeof second === 'undefined' || typeof third === 'undefined'){
		return false;
	}else{
		if(!first.found||!second.found||!third.found){
			return false;
		}else{
			return true;
		}
	}
}

function putInTrie(first,second,third,isValueAResource,isThird,trie,filename){

	var string = first.resource;
	var relationship = second.resource;
	var value = third.resource;
	if(third.isResource){
		value = decodeURIComponent((third.resource.toString().split("_").join(" ")).toLowerCase());
	}

	var clean = decodeURIComponent((string.toString().split("_").join(" ")).toLowerCase());
	var currentPositionInTrie;
	for (var i = 0; i<clean.length;i++){
		var currentChar = clean.charAt((i));
		if(i===0){
			if(currentChar in trie){
				currentPositionInTrie = trie[currentChar];
			}else{
				trie[currentChar]= {};
				currentPositionInTrie = trie[currentChar];
			}
		}else{
			if(currentChar in currentPositionInTrie){
				currentPositionInTrie = currentPositionInTrie[currentChar];
			}else{
				currentPositionInTrie[currentChar]={};
				currentPositionInTrie = currentPositionInTrie[currentChar];
			}
		}
		if(i===clean.length-1){
			//Putting in actual resource
			var words;
			if('wo' in currentPositionInTrie){
				words = currentPositionInTrie['wo'];
			}else{
				currentPositionInTrie['wo'] = {};
				words = currentPositionInTrie['wo'];
			}

			var obj;
			if(clean in words){
				obj = words[clean];
			}else{
				words[clean] = {};
				obj = words[clean];
			}

			var rs;
			if(relationship in obj){
				rs = obj[relationship];
			}else{
				obj[relationship] = [];
				rs = obj[relationship];
			}
			rs.push(value);
		}
	}


	if(isValueAResource && !isThird){
		var nextFilename = getFilenameOfTrieForString(third.resource);
		var nextTrie = getTrieForString(third.resource);
		if(nextFilename ===filename){

		}else{
			fs.unlinkSync(filename);
			fs.writeFileSync(filename, JSON.stringify(trie,null,3));
		}

		putInTrie(third,{'resource':'inlink'},first,true,true,nextTrie,nextFilename);
	}
}

function thirdPart(tokens){
	var remainder = ""
    for(var j = 2; j<tokens.length;j++){
	    remainder += tokens[j];
    }
	remainder = remainder.trim();
	if(endsWith(remainder, ".")){
		remainder = remainder.substring(0, remainder.length - 1);
		remainder = remainder.trim();
	}

    return remainder;
}

function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

//Remember that the ending > is already removed
function getEndStringFromSplit(string,separator){
	var results = string.split(separator);
	var result = {};
	result['found'] = false;

	if(results.length>=1){
		result['found'] = true;
		result['resource'] = results[results.length - 1];
	}else{
		console.log("<>><<><>> DIDNT GET RESULTS SOMETHING IS WRONGE!!!!!!<<>>><><><");
		console.log(JSON.stringify(result));
		process.exit();
	}

	return result;
}

function getEndStringFromDBPediaSingle(string,position){
	if(typeof string === 'undefined'){
		return {'found':false};
	}
	string = string.trim();
	if(position === 0){
		var separator = '<http://dbpedia.org/resource/';
		var result = getEndStringFromSplit(string,separator);
		result['isResource'] = true; //isResource
		return result;
	}else if(position === 1){
		var separator = '/';
		var result = getEndStringFromSplit(string,separator);
		result['isResource'] = false; //isResource
		return result;
	}else if(position === 2){
		//Either starts with quotes, or is a resource
		//If it is a resource, then return only the endstring
		if(string.lastIndexOf("<", 0) === 0){
			var result = getEndStringFromDBPediaSingle(string,0);
			result['isResource'] = true; //isResource
			return result;
		}else{
			//TODO This is a value, so no more lookups.
			var result = string.split('^^<');
			var result = result[0].split('@en .');
			var result = result[0].split('"');
			var last = result[1];

			var ret = {'found':true,'resource':last,'isResource':false};
			return ret;
		}
	}
}

function logm(message){
	var time = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
	console.log(time + " : "+message);
}

begin();
