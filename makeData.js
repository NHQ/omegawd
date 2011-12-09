var fs = require('fs'), trackmap = require('./lib/trackmap.js'), _ = require('underscore');

var arr = [], tags = {};

_.each(JSON.parse(trackmap).states, function(val, key){
	key = key.toLowerCase().replace(/\s/g, "")
		val.keywords.forEach(function(e){
			arr.push(e.toLowerCase().replace(/\s/g, ""))
		})
		_.each(val.cities, function(city,k){
			city.keywords.forEach(function(e){
				arr.push(e.toLowerCase().replace(/\s/g, ""))
			})
		})

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

			tagged = _.map(_.uniq(_.flatten([state.keywords, state.capital, state.abbreviation, state["most-populous-city"]])), 
										function(e){return e.toLowerCase().replace(/\s/g, "")});
			break;
			
		case false:
			tagged.push(state.abbreviation.toLowerCase());
			_.each(state.keywords, function(e){tagged.push(e)})
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
		
		_.each(this.states, function(val,state){
		 if(this.states[state].abbreviation == name){
			st = this.tags(this.states[state], _.isEmpty(this.states[state].cities));
			}
		}, this);
		return st
	}
	
	else if(_.contains(Object.keys(this.states), name)){
		// is a state
		var tags = this.tags(this.states[name], _.isEmpty(this.states[name].cities))
		return tags
		}
	else if(_.contains(Object.keys(this.tagCity), name)){
		// is a city
			var tags = this.tagCity[name.toUpperCase()];
			return tags
		}
	else {return null}
}

/*
var stats = JSON.parse(trackmap);
var states = {'states':{}};

_.each(stats.states, function(v,k){
		v.keywords = ['occupy'+k.replace(/\s/g,""), 'occupy'+v.abbreviation.replace(/\s/g,"")]
		if(_.isEmpty(v.cities)){
			if(v.capital == v['most-populous-city']){
				v.cities[v.capital] = {keywords : ['occupy'+v.capital.replace(/\s/g,"")]}
			}
			else {
				v.cities[v['most-populous-city']] = {keywords : ['occupy'+v['most-populous-city'].replace(/\s/g,"")]};
				v.cities[v.capital] = {keywords : ['occupy'+v.capital.replace(/\s/g,"")]}
			}
		}
		else {
		//	console.log('poo')
		 	_.each(v.cities, function(city, name){
				v.cities[name] =  { 'keywords' : _.map(city.keywords, function(e){ return 'occupy'+e.replace(/\s/g,"")})};

			})
		}
		states.states[k] = v;
	})
	*/
//fs.writeFileSync('./lib/USA.beta.json', JSON.stringify(states))
//console.log(Object.keys(stats.states))
//console.log(stats)
module.exports = data;