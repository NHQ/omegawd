var connect = require('connect')
,		vhost = require('./lib/subDomani')
,		_ = require('underscore');

var domani = ['citizenmission.com'];
var subs = ['rhetoric-report'];

var server = connect();
		server.use(connect.profiler());
		server.use(connect.logger());
		server.use(connect.favicon());
		server.use(connect.cookieParser());
		server.use(connect.session({secret: 'giddy gato' }));
		domani.forEach(function (domain) {
			server.use(vhost(domain, subs, _,
				require('./sites/citizenmission')(connect, _)
			))
		});
		server.use(require('./sites/citizenmission')(connect));
		server.listen(process.env.NODE_ENV === 'production' ? 80 : 80);
		console.log('Listening on ' + server.address().port);