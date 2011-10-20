var jade = require('jade'), redis = require('redis'), trackmap = require('../lib/trackmap.js'), _ = require('underscore'), 
		ows = require('../ows.js'), fs = require('fs');

var client = redis.createClient();
var mapper = {}, html = "";
var statesJSON = JSON.parse(fs.readFileSync('lib/States.json', encoding='utf8')).states.state;

_.each(trackmap, function(val,key){
	mapper[key] = ['occupy'+key]
	if(val)
	mapper[key].push('occupy'+val)
})

_.each(trackmap, function(v,k){
	k = k.replace(/\s/g,"_");
	html += '<a href="/'+k+'">'+k+'</a><br />'
})
console.log(html);

_.map(trackmap, function(val, key){
	
})

module.exports = function(connect, _){

	var server = connect();

		server.use(connect.router(function(app){
			app.get('/', function(req, res){
				res.writeHead('200', {'Content-Type': 'text/html'});
				res.end(html);
			})
			app.get('/:place', function(req, res){
				res.writeHead('200', {'Content-Type': 'text/html'})
				client.zrevrangebyscore('occupy'+req.params.place+':links', 100, 2, function(err, res){
					_.each(res, function(v){
						html += '<a href="/'+v[1]+'">'+v[1]+'</a><br />'
					})
					res.end(html)
				})
			})
		}));

		server.use(function (req, res){
			var ahem = occupy.mapper.ows.latest[0];
			console.log(ahem);
			var fn = jade.compile('h2 !{ahem}', {ahem : ahem});
			res.writeHead('200', {'Content-Type': 'text/html'});
			res.end(occupy.corral[ahem].txt);
	});
	return server
}; 