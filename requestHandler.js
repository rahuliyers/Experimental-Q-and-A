var fs = require('fs');
var url = require("url");
var wpapi = require("./wpapi");
var sendmail = require("./sendmail");
var path = require('path');
var pathSep = path.sep;

var pages = {'/':'./static/index.html','/robots.txt':'./static/robots.txt','/about':'./static/about.html'};
var scripts = {'/ajax.js':'./scripts/ajax.js','/main.js':'./scripts/main.js'};
var templates = {};
var images = {};

var mimeTypes = {'html':'text/html','js':'application/javascript','handleBarTemplate':"text/x-handlebars-template"};

function displayInfo(response,request){
	var url_parts = url.parse(request.url, true);
	var query = url_parts.query;
	var rp = {};
	rp['m'] = false;
	if(query.a){
		var lc = query.a.toString().toLowerCase();
		var pth = getPathForResource(lc);
		var filename = hashString(lc)+ '.json';

		var filePath = pth+filename;
// 		console.log('fp:' + filePath);
		fs.readFile(filePath,function(err,data){ //Get the path and file.json
			if(err){
				console.log("Err when displayInfo for: "+filePath);
				searchResponse(rp,response,request);
			}else{
				rp['m'] = true;
				var res = JSON.parse(data);
				rp['i'] = res;
				for(var pr in res){
					var br = res[pr];
					wpapi.getPrimaryImage(br['id'],function(imgObj){
						rp['im'] = imgObj;
						wpapi.extractRequest(br['id'],function(exObj){
							rp['ex'] = exObj;
							searchResponse(rp,response,request);
						})
					});
					break;
				}
			}
		});
	}else{
		searchResponse(rp,response,request);
	}
}

//If you change this, remember makeResourceMappingAnd///
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

function search(response,request){
	var suggestions = [];
	//TODO later on we will have to split all the words up. For now we assume there is just one word

	var url_parts = url.parse(request.url, true);
	var query = url_parts.query;
	var lc = "";
	if(query.term){
		lc = query.term.toLowerCase();
	}

	if(lc.length>2){
		//Check if directory exists for this length request
		var pth = getPathForResource(lc);

		pth +='index.json';

		fs.exists(pth, function (exists) {
			if(exists){
				//Read the file and return it
				fs.readFile(pth,function(err,data){
					if(err){
						console.log("There was an error reading: " + pth);
					}else{
						var ind = JSON.parse(data);
						var s = ind['s'];
						for(var i=0;i<s.length;i++){
							var key = s[i];
							var sugg = {};
							sugg['label'] = key;
							sugg['category'] = 'Suggestions:'; //TODO Later on remove the category
							suggestions.push(sugg);
						}

// 						console.log("Found index:" + JSON.stringify(ind));
						searchResponse(suggestions,response,request);
					}
				});
			}else{
// 				console.log("Not Found index 1: " + pth);
				searchResponse(suggestions,response,request);
			}
		});
	}else{
		//Report that there are no suggestions.
// 		console.log("Not Found index 3");
		searchResponse(suggestions,response,request);
	}
}

//If you change this, remember makeTrie. Remember to pass in a searchable resource for the path
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

function searchResponse(rp,response,request){
	response.writeHead(200, {"Content-Type": "application/json"});
	response.write(JSON.stringify(rp));
	response.end();
}

function getImages(){
	return templates;
}

function getTemplates(){
	return templates;
}

function getPages(){
	return pages;
}

function getScripts(){
	return scripts;
}

function staticResource(response,request,mimeType,dictionary){
	var pathname = url.parse(request.url).pathname;
// 	console.log("Received request for: " + pathname);
	if (pathname in dictionary){
		var fileName = dictionary[pathname];
		fs.readFile(fileName, 'utf8', function(err, data) {
			if (err){
				console.log("Error reading" + fileName +": " + err);
				response.writeHead(500,{"Content-Type": "text/plain"});
				response.write("There was an internal server error.");
				response.end();
			}else{
				response.writeHead(200,{"Content-Type": + mimeType});
				response.write(data);
				response.end();
			}
		});
	}else{
		console.log("Request for missing path:" + pathname);
		//TODO Need to update this. Add 404 page or something.
		response.writeHead(404, {"Content-Type": "text/plain"});
		response.write("404 Not Found");
		response.end();
	}
}

function script(response,request){
	staticResource(response,request,mimeTypes['js'],scripts);
}

function page(response,request){
	staticResource(response,request,mimeTypes['html'],pages);
}

function template(response,request){
	staticResource(response,request,mimeTypes["text/x-handlebars-template"],templates);
}

function objectToArray(object){
	if(!Array.isArray(object)){
		object = [].concat(object);
	}
	return object;
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

exports.displayInfo = displayInfo;
exports.search = search;
exports.page = page;
exports.getPages = getPages;
exports.script = script;
exports.getScripts = getScripts;
exports.getTemplates = getTemplates;
exports.template = template;
