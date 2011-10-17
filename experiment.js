this.self = {}
this.self.connect = require('connect');
this.self.vhost = require('./lib/subDomani');
this.self._ = require('underscore');
this.self.domani = ['citizenmission.com'];
this.self.subs = ['rhetoric-report'];

this.self.server = this.self.connect();
		this.self.server.use(this.self.connect.profiler());
		this.self.server.use(this.self.connect.logger());
		this.self.server.use(this.self.connect.favicon());
		this.self.server.use(this.self.connect.cookieParser());
		this.self.server.use(this.self.connect.session({secret: 'giddy gato' }));
		this.self.server.use(require('./sites/expCit')(this.self));
		this.self.server.listen(process.env.NODE_ENV === 'production' ? 80 : 8000);
		console.log('Listening on ' + this.self.server.address().port);