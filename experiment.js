this.wad = 2;
//eval('console.log(this.wad)');
//eval('function ewoo(){console.log(this)}ewoo()')
//eval('this.dog = "eats"');

var fs = require('./sites/dummy.js');
console.log(fs.dog)

/*

this.bb = {}
this.bb.connect = require('connect');
this.bb.vhost = require('./lib/subDomani');
this.bb._ = require('underscore');
this.bb.domani = ['citizenmission.com'];
this.bb.subs = ['rhetoric-report'];

this.bb.server = this.bb.connect();
		this.bb.server.use(this.bb.connect.profiler());
		this.bb.server.use(this.bb.connect.logger());
		this.bb.server.use(this.bb.connect.favicon());
		this.bb.server.use(this.bb.connect.cookieParser());
		this.bb.server.use(this.bb.connect.session({secret: 'giddy gato' }));
		this.bb.server.use(require('./sites/expCit')(this.bb));
		this.bb.server.listen(process.env.NODE_ENV === 'production' ? 80 : 8000);
		console.log('Listening on ' + this.bb.server.address().port);

*/