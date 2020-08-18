var http = require('http');

function getPrimaryImage(resourceName,callback){
	var filmObj = {};
// 	console.log("Request for image of:" + resourceName);
	firstRequest(resourceName,function(data){
		callback(data);
	});
}

function getExtract(resourceName,callback){
	var filmObj = {};
// 	console.log("Request for image of:" + resourceName);
	firstRequest(resourceName,function(data){
		callback(data);
	});
}

function extractRequest(resourceName,callback){
	var pathPrefix = '/w/api.php?action=query&titles=';
	var pathSuffix = '&prop=extracts&format=json&exintro=';
	var foo = resourceName;
	var request_options = 
	{
	    host: 'en.wikipedia.org',
	    headers: {'user-agent': 'MyAwesomeImageDl/1.1 (http://example.com/MyCoolTool/; fistoflegend@icloud.com) BasedOnSuperLib/1.4'},
	    path: pathPrefix+foo+pathSuffix
	};

	http.get(request_options, function(res) {
		var body='';
		res.on('data', function(chunk) {
		    body += chunk;
		});
		  
		res.on('end', function() {	
			if(body.length>2){
				var data;
				try{
					data = JSON.parse(body);
				}catch(e){
					var didntFindObject = {'found':false,'resourceName':resourceName};
					callback(didntFindObject); 
					return;
				}
				var data = JSON.parse(body);
				var ext = "";
				var fn = false;
				if(data.query){
					var q = data.query;
					if(q.pages){
						var p = q.pages;

						for(var page in p){
							var bra = p[page];
							var es = 'extract';
							if(bra[es]){
								ext = bra[es];
								if(ext.length>0){
									fn = true;
								}
							}
							break;
						}
					}
				}
				
			    var foundObject = {'found':fn,'data':ext};
			    callback(foundObject); 
			}else{
// 				console.log("Missing body for: " + foo + "isFirst:" + isFirst);
				var didntFindObject = {'found':false,'resourceName':resourceName};
				callback(didntFindObject); 
			}
		});
		
	}).on('error', function(e) {
		console.log("Got error: " + e.message);
		var didntFindObject = {'found':false,'resourceName':resourceName};
		callback(didntFindObject); 
		//TODO send an email when error occurred.
	});
}

function firstRequest(resourceName,callback){
	request(resourceName,callback,'/w/api.php?action=query&titles=','&prop=pageimages&format=json',true,'');
}

function secondRequest(filename,resourceName,callback){
	request(resourceName,callback,'/w/api.php?action=query&titles=File:','&prop=imageinfo&iiprop=url&format=json',false,filename);
}

function request(resourceName,callback,pathPrefix,pathSuffix,isFirst,filename){
	
	var foo = '';
	if(isFirst){
		foo = resourceName;
	}else{
		foo = filename;
	}
	
	var request_options = 
	{
	    host: 'en.wikipedia.org',
	    headers: {'user-agent': 'MyAwesomeImageDl/1.1 (http://example.com/MyCoolTool/; fistoflegend@icloud.com) BasedOnSuperLib/1.4'},
	    path: pathPrefix+foo+pathSuffix
	};

	http.get(request_options, function(res) {
		var body='';
		res.on('data', function(chunk) {
		    body += chunk;
		});
		  
		res.on('end', function() {	
			if(body.length>2){
				var data;

				try{
					data = JSON.parse(body);
				}catch(e){
					var didntFindObject = {'found':false,'resourceName':resourceName};
					callback(didntFindObject);
					return;
				}
			    if(isFirst){
				    gotFirstRequest(callback,data,resourceName);
			    }else{
				    gotSecondRequest(callback,data,resourceName,filename);
			    }
			}else{
// 				console.log("Missing body for: " + foo + "isFirst:" + isFirst);
				var didntFindObject = {'found':false,'resourceName':resourceName};
				callback(didntFindObject); 
			}
		});
		
	}).on('error', function(e) {
		console.log("Got error: " + e.message);
		var didntFindObject = {'found':false,'resourceName':resourceName};
		callback(didntFindObject); 
		//TODO send an email when error occurred.
	});
}

function gotFirstRequest(callback,data,resourceName){
	var found = false;
	if(data.query){
	    if(data.query.pages){
		    for(var property in data.query.pages){
			    if(data.query.pages[property].pageimage){
				    var filename = data.query.pages[property].pageimage;
					found = true;
				    secondRequest(filename,resourceName,callback);
			    }
			    break;
		    } 
	    }
    }
    
    if(!found){
	    var didntFindObject = {'found':false,'resourceName':resourceName};
		callback(didntFindObject); 
    }
}

function gotSecondRequest(callback,data,resourceName,filename) {
	var found = false;
    if (data.query) {
        if (data.query.pages) {
            for (var property in data.query.pages) {
                if (data.query.pages[property].imageinfo) {
                    var boo = data.query.pages[property].imageinfo;
                    boo = objectToArray(boo);
                    if (boo.length > 0) {
                        var first = boo[0];
                        if (first.url) {
	                        found = true;
	                        var foundObject = {'found':true,'resourceName':resourceName,'url':first.url};
                            callback(foundObject);
                        }
                    }
                }
                break;
            }
        }
    }
    
    if(!found){
	    var didntFindObject = {'found':false,'resourceName':resourceName};
		callback(didntFindObject); 
    }
}

function objectToArray(object){
	if(!Array.isArray(object)){
		object = [].concat(object);
	}
	return object;
}

exports.getPrimaryImage = getPrimaryImage;
exports.extractRequest = extractRequest;
