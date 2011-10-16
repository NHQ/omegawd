var connect = require('connect');

var subDomani = ['rhetoric-report']

var server = connect();
	subDomani.forEach(function (domain) {
		server.use(connect.vhost(domain+'.citizenmission.com', 
			connect().use(function (req,res){
				res.writeHead('200');
				res.end('<h2>Yodal!</h2>');
						console.log(req.subdomains)
			})
		))
	});
	server.use(function (req,res){
		res.writeHead('200', {'Content-Type': 'text/html'});
		res.end('<h2>Boo!</h2>'+req.session.cookie.maxAge);
	});

	
module.exports = server; 