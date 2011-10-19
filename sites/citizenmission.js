var jade = require('jade');

module.exports = function(connect, tweet, _){
	var ahem = tweet.switchBoard.mapper.ows.latest.length;
	var server = connect();
	/*
		server.use(connect.router(function(app){
			app.get('/', function(req, res){
				res.writeHead('200', {'Content-Type': 'text/html'});
				res.end('<h2>Boo!</h2>'+req.session.cookie.maxAge);
			})
		}));
	*/
		server.use(function (req, res){
			console.log(req.subdomains);
			var fn = jade.compile('h2 !{ahem}');
			res.writeHead('200', {'Content-Type': 'text/html'});
			res.end(fn());
	});
	return server
}; 