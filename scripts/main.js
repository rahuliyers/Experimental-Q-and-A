var pn = $("#pn").html();
var pt = $("#pCV").html();
var flm = $("#flm").html();
var pntemplate = Handlebars.compile(pn);
var template = Handlebars.compile(pt);
var flmTemplate = Handlebars.compile(flm);

$.widget("custom.catcomplete", $.ui.autocomplete, {
    _create: function() {
        this._super();
        this.widget().menu("option", "items", "> :not(.ui-autocomplete-category)");
    },
    _renderMenu: function(ul, items) {
        var that = this,
            currentCategory = "";
        $.each(items, function(index, item) {
            var li;
            if (item.category != currentCategory) {
                ul.append("<li class='ui-autocomplete-category'>" + item.category + "</li>");
                currentCategory = item.category;
            }
            li = that._renderItemData(ul, item);
            if (item.category) {
                li.attr("aria-label", item.category + " : " + item.label);
            }
        });
    },
});

$(function() {

    $("#search").catcomplete({
        delay: 0,
        source: "search",
        select: function(event, ui) {
            ajax.get("/displayInfo", {
                a: ui.item.value
            }, displayInfo, true);
        }
    });
});

function onClickLink(resource){
	ajax.get("/displayInfo", {
                a: resource
            }, displayInfo, true);
}

function displayInfo(data) {
// 	console.log("displayInfo got:"+data);
    var o = JSON.parse(data);
	var mainNode = document.getElementById("main");
	while (mainNode.firstChild) {
    	mainNode.removeChild(mainNode.firstChild);
	}
	var row = document.createElement('div');
	row.setAttribute('class', 'row');
	
 	if(o.m){
	 	var col1 = document.createElement('div');
	 	col1.setAttribute('class', 'col-xs-12 col-sm-4');
	 	row.appendChild(col1);
	 	
 		var i = o.i;
//  		console.log(JSON.stringify(i));
 		for(var pro in i){
	 		var cur = i[pro];
	 		var tb = document.createElement('table');
	 		col1.appendChild(tb);
	 		for(var prop in cur){
		 		if(prop==='cowgleId'){
			 		
		 		}else{
			 		var tr = document.createElement('tr');
			 		tb.appendChild(tr);
			 		var th = document.createElement('th');
			 		tr.appendChild(th);
			 		var h = document.createTextNode(prop);
			 		th.appendChild(h);
			 		var td = document.createElement('td');
			 		tr.appendChild(td);
			 		var tx = document.createTextNode(cur[prop]);
			 		td.appendChild(tx);
		 		}
	 		}
	 		break;
 		}
 		
 		var col2 = document.createElement('div');
	 	col2.setAttribute('class', 'col-xs-12 col-sm-4');
	 	row.appendChild(col2);
 		
 		var im = o.im;
 		if(im.found===true){
	 		var img = document.createElement('img');
	 		img.setAttribute('src', im.url)
	 		col2.appendChild(img);
 		}
 		
 		var col3 = document.createElement('div');
	 	col3.setAttribute('class', 'col-xs-12 col-sm-4');
	 	row.appendChild(col3);
 		var ex = o.ex;
 		if(ex.found===true){
	 		var pra = document.createElement('p');
	 		pra.innerHTML = ex.data;
	 		col3.appendChild(pra);
 		}
 		
 		mainNode.appendChild(row);
 	}
}

function addslashes( str ) {
    return (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
}

function objectToArray(object){
	if(!Array.isArray(object)){
		object = [].concat(object);
	}
	return object;
}