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

data.mapTags = function (input){
	
	this.tags = function (state, bool){
				var tagged = [];
		switch (bool)
		{
		case true:

			tagged = _.map(_.uniq([state.capital, state.abbreviation, state["most-populous-city"]]), function(e){return e.toLowerCase().replace(/\s/g, "")});
			break;
			
		case false:
			
			_.each(state.cities, function(city){
				_.each(city.keywords, function(words){
					tagged.push(words.toLowerCase().replace(/\s/g, ""))
				})
			})
			break;
		}

		return _.flatten(tagged)
	}
	
	var name = input.toUpperCase().replace(/_/g, " ")
	
	if(name.length === 2){
		// is abbr.
		var st;
		
		_.each(this.states, function(state){
		 if(state.abbreviation == name){
			st = this.tags(state, _.isEmpty(state.cities));
			}
		}, this)
		return st
	}
	
	else if(_.contains(Object.keys(this.states), name)){
		// is a state
		var state = trackmap.name;
		var tags = tags(this.states[name], _.isEmpty(this.states[name].cities)) 
		return tags
		}
	else if(_.contains(Object.keys(this.tagCity), name)){
		// is a city
			var tags = this.tagCity[name];
			return tags
		}
	else {return null}
}

module.exports = data;

