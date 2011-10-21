var fs = require('fs'), trackmap = require('./lib/trackmap.js'), _ = require('underscore');

var arr = [], tags = {};

_.each(JSON.parse(trackmap).states, function(val, key){
	key = key.toLowerCase().replace(/\s/g, "")
	arr.push(key, val.abbreviation.toLowerCase());
	if(_.isEmpty(val.cities)){
		arr.push(val.capital.toLowerCase().replace(/\s/g, ""), val["most-populous-city"].toLowerCase().replace(/\s/g, ""))
	}
	else if (!_.isEmpty(val.cities)){
		arr.push(val.capital.toLowerCase().replace(/\s/g, ""))
		_.each(val.cities, function(city,k){
			city.keywords.forEach(function(e){
				arr.push(e.toLowerCase().replace(/\s/g, ""))
			})
		})
	}
})

_.map(JSON.parse(trackmap).states, function(val, key){
	if(!_.isEmpty(val.cities)){
		_.each(val.cities, function(val, key){
			var city = key.toUpperCase();
			tags[city] = _.map(val.keywords, function(e){
				return e.toLowerCase().replace(/\s/g, "")
			})
		})
	}
	else if (_.isEmpty(val.cities)){
		var cap = val.capital.toUpperCase();
		tags[cap] = [cap.toLowerCase().replace(/\s/g, "")];
		var pop = val["most-populous-city"].toUpperCase();
		tags[pop] = [val["most-populous-city"].toLowerCase().replace(/\s/g, "") ]
	}
})

var str = _.uniq(arr).join()

var data = {trackstring: str, tracklist: _.uniq(arr), states: JSON.parse(trackmap).states, tagCity : tags}

module.exports = data;

