var jade = require('jade'), redis = require('redis'), trackmap = require('../makeData.js'), _ = require('underscore'), fs = require('fs'), async = require('async');

var client = redis.createClient();
var mapper = {}, html = "";

function mapTags (input){
	
	function tags (state, bool){
		var tags = [];
		switch (bool)
		
		{
		case true:

			tags = _.map(_.uniq([state.capital, state.abbreviation, state["most-populous-city"]]), function(e){return e.toLowerCase().replace(/\s/g, "")})
			break;
			
		case false:
			
			_.each(state.cities, function(city){
				_.each(city.keywords, function(words){
					tags.push(words.toLowerCase().replace(/\s/g, ""))
				})
			})
						
			break
		}
		
		return (_.flatten(tags))
		
	}
	
	var name = input.toUpperCase().replace(/_/g, " ")
	
	if(_.contains(Object.keys(trackmap.states), name)){
		// is a state
		var state = trackmap.name;
		var tags = tags(trackmap.states[name], _.isEmpty(trackmap.states[name].cities)) 
		return tags
		}
	if(_.contains(Object.keys(trackmap.tagCity), name)){
		// is a city
			var tags = trackmap.tagCity[name];
			return tags
		}
}


module.exports = function(connect, _){

	var server = connect();
		server.use(function(req,res,next){
			client.zunionstore('daily', 3, 'ows:links', 'occupy:links', '99percent:links', function(err, res){
				client.zremrangebyscore('daily', 0, 17, function(e,r){
					next()
				})
			})
		});
		
		server.use(connect.router(function(app){
			app.get('/', function(req, res){
				res.writeHead('200', {'Content-Type': 'text/html'})
				res.end('<script>window.location = "http://citizenmission.com/ows"</script>')
			})
			app.get('/:place', function(req, res){
				res.writeHead('200', {'Content-Type': 'text/html'});
				var index = 'occupy'+req.params.place.replace(/_/g, "")+':links';
				if(req.params.place.toLowerCase() === 'ows'){
					index = 'daily';
				}
				var eche = "Top = most repeatedly shared: <br /><br />";
				function append(k, cb){
					k = JSON.parse(k);
					var p = k[1] || k[0];
					eche += '<a href='+p+'>'+p+'</a><br />'
					cb(null);
				};
				client.zrevrangebyscore(index.toLowerCase(), '+inf', 1, function(e,r){
					async.forEachSeries(r,append,function(err){
						res.end(eche)
					})
				})
			})
		}));

		server.use(function (req, res){
			var fn = jade.compile('h2 !{ahem}', {ahem : ahem});
			res.writeHead('200', {'Content-Type': 'text/html'});
			res.end();
	});
	return server
}; 