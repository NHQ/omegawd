var fs = require('fs'), trackmap = require('./lib/trackmap.js'), _ = require('underscore');

var arr = [];

_.each(JSON.parse(trackmap).states, function(val, key){
	key = key.toLowerCase().replace(/\s/g, "")
	arr.push(key, val.abbreviation.toLowerCase());
	if(_.isEmpty(val.cities)){
		arr.push(val.capital.toLowerCase().replace(/\s/g, ""), val["most-populous-city"].toLowerCase().replace(/\s/g, ""))
	}
	else if (!_.isEmpty(val.cities)){
		_.each(val.cities, function(city,k){
			city.keywords.forEach(function(e){
				arr.push(e.toLowerCase().replace(/\s/g, ""))
			})
		})
	}
})

var str = _.uniq(arr).join()

var data = {trackstring: str, tracklist: _.uniq(arr), states: JSON.parse(trackmap)}

module.exports = data;

