var jade = require('jade'), redis = require('redis'), trackmap = require('../makeData.js'), _ = require('underscore'), 
		ows = require('../ows.js'), fs = require('fs'), async = require('async');

var client = redis.createClient();
var mapper = {}, html = "";
/*
_.each(trackmap, function(v,k){
	k = k.replace(/\s/g,"_");
	html += '<a href="/'+k+'">'+k+'</a><br />'
	if(v){
		html += '<a href="/'+v+'">'+v+'</a><br />'
	}
})
*/


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
			app.get('/analytics', function(res, res){
				res.writeHead('200', {'Content-Type': 'text/html'})
				res.end(Object.keys(ows.corral).length.toString())
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
			var ahem = occupy.mapper.ows.latest[0];
			var fn = jade.compile('h2 !{ahem}', {ahem : ahem});
			res.writeHead('200', {'Content-Type': 'text/html'});
			res.end(occupy.corral[ahem].txt);
	});
	return server
}; 