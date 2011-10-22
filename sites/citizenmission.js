var jade = require('jade'), redis = require('redis'), trackmap = require('../makeData.js'), _ = require('underscore'), fs = require('fs'), async = require('async');

var client = redis.createClient();
var mapper = {}, html = "";

 console.log(trackmap.mapTags("il"))

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
				res.end('<script>window.location = "http://citizenmission.com/occupy"</script>')
			})
			
			app.get('/occupy', function(req, res){
				res.writeHead('200', {'Content-Type': 'text/html'})
				var eche = "Top = most repeatedly shared: <br /><br />";
				function append(k, cb){
					k = JSON.parse(k);
					var p = k[1] || k[0];
					eche += '<a href='+p+'>'+p+'</a><br />'
					cb(null);
				};
				client.zrevrangebyscore('daily', '+inf', 17, function(e,r){
					async.forEachSeries(r,append,function(err){
						res.end(eche)
					})
				})
			})
			
			app.get('/:place', function(req, res){
				res.writeHead('200', {'Content-Type': 'text/html'});
				
				console.log(req.params.place);
				
				var tags = trackmap.mapTags(req.params.place);
				
				var eche = "Top = most repeatedly shared: <br /><br />";
				
				function append(k, cb){
					k = JSON.parse(k);
					var p = k[1] || k[0];
					eche += '<a href='+p+'>'+p+'</a><br />'
					cb(null);
				};
				
				client.zunionstore(
					req.params.place+':agg', 
					tags.length, 
					_.map(tags, function(tag){ return 'occupy'+tag+':links'}), 
					function(e,r){
						console.log(arguments)
						client.zrevrangebyscore(req.params.place+':agg', '+inf', 2, function(e,r){
							async.forEachSeries(r,append,function(err){
								res.end(eche)
							})
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