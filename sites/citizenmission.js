var jade = require('jade'),		occupy = require('../ows');

module.exports = function(connect, _){

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
			var ahem = occupy.ows.latest.length;
			console.log(req.subdomains);
			var fn = jade.compile('h2 !{ahem}', {ahem : ahem});
			res.writeHead('200', {'Content-Type': 'text/html'});
			res.end(fn());
	});
	return server
}; 