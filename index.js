var fs = require('fs');
var server = require("./server");
var router = require("./router");
var requestHandler = require("./requestHandler");

var handle = {};
function loadHandlers(){
	var pages = requestHandler.getPages();
	for (var page in pages){
// 		console.log("Adding page: " + page);
		handle[page] = requestHandler.page;
	}
	
	var scripts = requestHandler.getScripts();
	for (var script in scripts){
// 		console.log("Adding script: " + script);
		handle[script] = requestHandler.script;
	}
	
	var templates = requestHandler.getTemplates();
	for (var template in templates){
// 		console.log("Adding template: " + template);
		handle[template] = requestHandler.template;
	}
}
loadHandlers();
handle["/search"] = requestHandler.search;
handle["/displayInfo"] = requestHandler.displayInfo;


function start(){
/*
	if(!fs.existsSync("./ready.txt")){
		var createGraph = require('./createGraph.js');
		console.log("Index not available,creating...");
		createGraph = createGraph.createGraph();
	}else{
		server.startServer(router.route,handle);
		console.log("Cowgle is starting up.");
	}
*/
	server.startServer(router.route,handle);
	console.log("Cowgle is starting up.");

}

start();