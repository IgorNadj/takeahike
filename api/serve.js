var sqlite3 = require('sqlite3'),
	http = require('http'),
	url = require('url');


var PORT = 80;


// init db
sqlite3.verbose();
var db = new sqlite3.Database('db.sqlite');


// init server
var server = http.createServer(function(request, response){
	// allow access from wherevs
	response.setHeader('Access-Control-Allow-Origin', '*');

	var requestParts = url.parse(request.url, true);
	console.log('Access: '+requestParts.pathname);

	api(requestParts.pathname, request, response);
});

server.listen(PORT, function(){
    console.log("Server listening on: http://localhost:%s", PORT);
});


// controller
function api(action, request, response){
	if(action == '/huts'){
		db.all('SELECT * FROM hut;', function(err, rows){
			var data = {
				rows: rows
			};
			response.end(JSON.stringify(data));
		});
	}
}
