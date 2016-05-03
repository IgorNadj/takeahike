var tj = require('togeojson'),
    fs = require('fs'),
    // node doesn't have xml parsing or a dom. use jsdom
    jsdom = require('jsdom').jsdom,
    sqlite3 = require('sqlite3');


// init db
sqlite3.verbose();
var db = new sqlite3.Database('db.sqlite');


// huts
var kml = jsdom(fs.readFileSync('res/DOCHuts.kml', 'utf8'));
var converted = tj.kml(kml);
console.log('FIRST FEATURE: ', converted.features[0]);

db.serialize(function(){

	db.run('DELETE FROM hut;');

	for(var i in converted.features){
		var feature = converted.features[i];

		if(!feature.geometry.coordinates || !feature.geometry.coordinates[1]){
			console.error('No coords!', feature);
		}

		var sql = 'INSERT INTO hut (name, desc, lat, long) VALUES (?, ?, ?, ?);';
		var params = [feature.properties.name, feature.properties.description, feature.geometry.coordinates[1], feature.geometry.coordinates[0]];

		db.run(sql, params);
	}

})