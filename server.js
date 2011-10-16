var connect = require('connect');

var domani = ['citizenmission.com'];
var subDomani = ['rhetoric-report.citizenmission.com'];

var server = connect();
	server.use(connect.logger());
	server.use(connect.favicon());
	server.use(connect.cookieParser());
	server.use(connect.session({secret: 'keyboard cat' }));
	server.use(function(req,res, next){
		                        var ip_address = null;
		                        try {
		                                ip_address = req.headers['x-forwarded-for'];
		                        }
		                        catch ( error ) {
		                                ip_address = req.connection.remoteAddress;
		                        }
		                        sys.puts( ip_address );
		console.log(req.headers);
		next();
	});
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
	});
	server.listen(process.env.NODE_ENV === 'production' ? 80 : 8000);
	console.log('Listening on ' + server.address().port);