var connect = require('connect')
,		vhost = require('./lib/subDomani')
,		_ = require('underscore');

var domani = ['citizenmission.com'];
var subs = ['rhetoric-report'];

var server = connect();
	server.use(connect.logger());
	server.use(connect.favicon());
	server.use(connect.cookieParser());
	server.use(connect.session({secret: 'keyboard cat' }));
	server.use(function(req, res, next){
		console.log( req.connection );
		console.log(req.pathname);
		next();
	});
	domani.forEach(function (domain) {
		server.use(vhost(domain, subs,
			require('./sites/citizenmission')
		))
	});
	server.use(function (req,res){
		res.writeHead('200', {'Content-Type': 'text/html'});
		res.end('<h2>Howdy!</h2>'+req.session.cookie.maxAge);
	});
	server.listen(process.env.NODE_ENV === 'production' ? 80 : 8000);
	console.log('Listening on ' + server.address().port);