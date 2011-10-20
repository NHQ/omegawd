var jade = require('jade'), redis = require('redis'), trackmap = require('../lib/trackmap.js'), _ = require('underscore'), 
		ows = require('../ows.js'), fs = require('fs'), async = require('async');

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
	if(v){
		html += '<a href="/'+v+'">'+v+'</a><br />'
	}
})

_.map(trackmap, function(val, key){
	
})

module.exports = function(connect, _){

	var server = connect();
		server.use(function(req,res,next){
			client.zunionstore('daily', 3, 'ows:links', 'occupy:links', '99percent:links', function(err, res){
				console.log(err, res);
				client.zremrangebyscore('daily', 0, 30, function(e,r){
					next()
				})
			})
		});
		
		server.use(connect.router(function(app){
			app.get('/', function(req, res){
				res.writeHead('200', {'Content-Type': 'text/html'});
				res.end(html);
			})
			app.get('/:place', function(req, res){
				res.writeHead('200', {'Content-Type': 'text/html'});
				var index = 'occupy'+req.params.place.replace(/_/g, "")+':links';
				if(req.params.place.toLowerCase() === 'ows'){
					index = 'daily';
				}
				var eche = "";
				console.log(index)
				function append(k, cb){
					k = JSON.parse(k);
					var p = k[1] || k[0];
					eche += '<a href='+p+'>'+p.slice(1,-1)+'</a><br />'
					cb(null);
				};
				client.zrevrangebyscore(index.toLowerCase(), '+inf', 2, function(e,r){
					async.forEachSeries(r,append,function(err){
						res.end(eche)
					})
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