var connect = require('connect');

var subDomani = ['rhetoric-report']

var server = connect();
	subDomani.forEach(function (domain) {
		server.use(connect.vhost(domain, 
			connect().use(function (req,res){
				res.writeHead('200')
				res.end('<h2>Yodal!</h2>')
			})
		))
	});
	server.use(function (req,res){
		res.writeHead('200', {'Content-Type': 'text/html'});
		res.end('<h2>Howdy!</h2>'+req.session.cookie.maxAge);
		console.log(req.subdomains)
	});

	
module.exports = server; 