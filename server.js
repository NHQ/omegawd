var connect = require('connect')
,		vhost = require('./lib/subDomani')
,		_ = require('underscore');

var domani = ['citizenmission.com'];
var subs = ['rhetoric-report'];

var server = connect();
		server.use(function(req,res,next){
			req.subdomain = req.headers.host.slice(0, req.headers.host.indexOf("."));
			console.log(req.subdomain);
			next()
		});
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
//		server.listen(process.env.NODE_ENV === 'production' ? 80 : 80);
//		console.log('Listening on ' + server.address().port);
		
		var cluster = require('cluster');

		cluster(server)
		  .use(cluster.logger('logs'))
		  .use(cluster.stats())
		  .use(cluster.pidfiles('pids'))
		  .use(cluster.cli())
		  .use(cluster.repl(8888))
		  .listen(80);