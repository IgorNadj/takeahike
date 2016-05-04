var tj = require('togeojson'),
    fs = require('fs'),
    // node doesn't have xml parsing or a dom. use jsdom
    jsdom = require('jsdom').jsdom,
    sqlite3 = require('sqlite3');


// init db
sqlite3.verbose();
var db = new sqlite3.Database('db.sqlite');


// huts
var hutsKml = jsdom(fs.readFileSync('res/huts.kml', 'utf8'));
var hutsConverted = tj.kml(hutsKml);
// console.log('FIRST FEATURE: ', hutsConverted.features[0]);

// campsites
var campsitesKml = jsdom(fs.readFileSync('res/campsites.kml', 'utf8'));
var campsitesConverted = tj.kml(campsitesKml);
// console.log('FIRST FEATURE: ', JSON.stringify(campsitesConverted.features[0]));

// tracks
var tracksKml = jsdom(fs.readFileSync('res/tracks.kml', 'utf8'));
var tracksConverted = tj.kml(tracksKml);
// console.log('FIRST FEATURE: ', JSON.stringify(tracksConverted.features[0]));


db.serialize(function(){

	db.run('DELETE FROM hut;');
	db.run('DELETE FROM campsite;');
	db.run('DELETE FROM track;');

	// huts
	for(var i in hutsConverted.features){
		var feature = hutsConverted.features[i];

		if(!feature.geometry.coordinates || !feature.geometry.coordinates[1]){
			console.error('No coords!', feature);
		}

		var sql = 'INSERT INTO hut (name, desc, lat, long) VALUES (?, ?, ?, ?);';
		var params = [feature.properties.name, feature.properties.description, feature.geometry.coordinates[1], feature.geometry.coordinates[0]];

		db.run(sql, params);
	}

	// campsites
	for(var i in campsitesConverted.features){
		var feature = campsitesConverted.features[i];

		if(!feature.geometry.coordinates || !feature.geometry.coordinates[1]){
			console.error('No coords!', feature);
		}

		var sql = 'INSERT INTO campsite (name, desc, lat, long) VALUES (?, ?, ?, ?);';
		var params = [feature.properties.name, feature.properties.description, feature.geometry.coordinates[1], feature.geometry.coordinates[0]];

		db.run(sql, params);
	}

	// tracks
	for(var i in tracksConverted.features){
		var feature = tracksConverted.features[i];

		// convert coords
		var convertedPaths = [];
		if(feature.geometries){
			for(var j in feature.geometries){
				var convertedPath = [];
				for(var k in feature.geometries[j].coordinates){
					convertedPath.push({
						lat: feature.geometries[j].coordinates[k][1],
						lng: feature.geometries[j].coordinates[k][0]			
					});
				}
				convertedPaths.push(convertedPath);
			}
		}else{
			var convertedPath = [];
			for(var j in feature.geometry.coordinates){
				convertedPath.push({
					lat: feature.geometry.coordinates[j][1],
					lng: feature.geometry.coordinates[j][0]			
				});
			}
			convertedPaths.push(convertedPath);
		}
		

		var sql = 'INSERT INTO track (name, desc, path_json) VALUES (?, ?, ?);';
		var params = [feature.properties.name, feature.properties.description, JSON.stringify(convertedPaths)];

		db.run(sql, params);
	}

});