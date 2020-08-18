var fs = require('fs');
var readline = require('readline');
var stream = require ('stream');

var smallFileLocation = '../cowgleData/sortedSmall.txt';
var resources = {};
var relationships = {};
var resourceCounter = 0;
var relationshipCounter = 0;

function begin(){
	var instream = fs.createReadStream(smallFileLocation);
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
		var tokens = line.split("\t|\t");
		var resource = tokens[0].trim();
		var relationship = tokens[1].trim();
		var value = tokens[2].trim();
		
		if(resource in resources){
			
		}else{
			var clean = decodeURIComponent(resource);
			resources[clean] = resourceCounter++;
		}
		
		if(relationship in relationships){
			
		}else{
			relationships[relationship] = relationshipCounter++;
		}
		
		if(ctr % 100000 === 0){
			console.log("Read: " + ctr);
		}
		
		if(ctr===33449630){
			console.log("Loop writing");
			fs.writeFileSync('../cowgleData/resourceIndex.json',JSON.stringify(resources));		
			fs.writeFileSync('../cowgleData/relIndex.json',JSON.stringify(relationships));
		}
	    ctr++;
	}).on('end', function(){
		console.log('Finished reading. Now writing index');
		fs.writeFileSync('../cowgleData/resourceIndex.json',resources,function(err){
			if(err){
				console.log("There was an error creating the resources file");
			}			
		});
		
		fs.writeFileSync('../cowgleData/relIndex.json',relationships,function(err2){
			if(err2){
				console.log("There was an error creating the relationships file");
			}			
		});
	});
}

begin();


