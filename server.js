var connect = require('connect');

var domani = ['citizenmission.com'];
var subDomani = ['rhetoric-report'];

var server = connect();
	server.use(connect.logger());
	server.use(connect.favicon());
	server.use(connect.cookieParser());
	server.use(connect.session({secret: 'keyboard cat' }));
	domani.forEach(function (domain) {
		server.use(connect.vhost(domain, 
			require('./sites/citizenmission')
		))
	});
	subDomani.forEach(function (domain) {
		server.use(connect.vhost(domain, 
			require('./sites/citizenmission')
		))
	});
	server.use(function (req,res){
		res.writeHead('200', {'Content-Type': 'text/html'});
		res.end('<h2>Howdy!</h2>'+req.session.cookie.maxAge);
		console.log(req.headers);
		console.log(req.subdomains)
	});
	server.listen(process.env.NODE_ENV === 'production' ? 80 : 8000);
	console.log('Listening on ' + server.address().port);