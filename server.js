var connect = require('connect');

var domani = ['citizenmission.com']

var server = connect();
	server.use(connect.logger());
	server.use(connect.favicon());
	server.use(connect.cookieParser());
	server.use(connect.session({secret: 'keyboard cat' }));
	domani.forEach(function (domain) {
		server.use(connect.vhost(domain, 
			connect().use(function (req,res){
				res.writeHead('200')
				res.end('<h2>Yodal!</h2>')
			})
		))
	});
	server.use(function (req,res){
		res.writeHead('200', {'Content-Type': 'text/html'});
		res.end('<h2>Howdy!</h2>')
	});
	server.listen(3000);