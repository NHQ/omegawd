
/**
 * Module dependencies.
 */

var express = require('express')
,		redis = require('redis')
, 	RedisStore = require('connect-redis')(express)
,	  trackmap = require('../../makeData.js')
,		_ = require('underscore');

var app = module.exports = express.createServer();
app.listen(8008);
var	io = require('socket.io').listen(app);
io.set('log level', 0);
// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'your secret here' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', function(req, res){
  res.render('index', {
		layout: false,
    title: 'Express',
		states: Object.keys(trackmap.states),
		cities: Object.keys(trackmap.tagCity).sort()
  });
});

app.get('/interface', function(req, res){
  res.render('interface', {
		layout: false,
    title: 'Interface'
  });
});

io.sockets.on('connection', function (socket) {
	var	client = redis.createClient()
	,		index = redis.createClient();
	socket.synd = redis.createClient();
	socket.subs = [];
//	console.log(socket);
	
	socket.on('disconnect', function(){
		_.each(socket.subs, function(e){
			this.leave(e.toLowerCase());
			index.zincrby('syndicate', -1, e, function(err,r){
				console.log(r);
				if (r == 0){	
					console.log('unsubbin');
					client.unsubscribe(e);
				}
			})
		}, this)
	})
	
	socket.on('subscribe', function(data){
		if(data.toLowerCase() == 'occupy'){
			
			tags = ['occupy:pub', 'ows:pub', '99percent:pub', 'occupywallst:pub', 'occupywallstreet:pub'];
	
			_.each(tags, function(e){
				this.subs.push[e];
				this.join(e.toLowerCase());
				index.zincrby('syndicate', 1, e, function(err,r){
					console.log(r);
					if (r == 1){	
						console.log('subbin');
						client.subscribe(e);
					}
				})
			},this)
		}
		else {
			
			var tags = _.map(trackmap.mapTags(data), function(k){
				return 'occupy'+k+':pub';
			});	
			
			_.each(tags, function(e){
				this.subs.push[e];
				this.join(e.toLowerCase());
				index.zincrby('syndicate', 1, e, function(err,r){
					console.log(r);
					if (r == 1){	
						console.log('subbin');
						client.subscribe(e);
					}
				})
			},this)
		}
	});
	var xeon = 0;
	var buff = new Buffer(608);
	var llen = 0;
	var stuff = ''
	socket.on('blob', function(data){
		++xeon;
		var offset = xeon;
		var base64 = function (encoded) {
			var buff = new Buffer(encoded, 'base64'),
					end = buff.byteLength;
		  return buff.write('utf8', 0, end);
		};
//		console.log(data)
		
		if(typeof data === 'object'){
		}
		if(Array.isArray(data)){
			var buff = new Buffer(data[1]);
			console.log(buff.toString('utf8'))

	//		buff.writeUInt8(data, xeon - 1);
	//		console.log(buff.toString('utf8', xeon, xeon + 1 ))
		}
		this.emit('conf', 'aye aye!')
	});
	socket.on('unsubscribe', function(data){
		if(data.toLowerCase() == 'occupy'){
		
			tags = ['occupy:pub', 'ows:pub', '99percent:pub', 'occupywallst:pub', 'occupywallstreet:pub']
		
			_.each(tags, function(e){
				this.subs = _.without(this.subs, e);
				this.leave(e.toLowerCase());
				index.zincrby('syndicate', -1, e, function(err,r){
					console.log(r);
					if (r == 0){	
						console.log('unsubbin');
						client.unsubscribe(e);
					}
				})
			},this)
		}
		
		else {
			
			var tags = _.map(trackmap.mapTags(data), function(k){
				return 'occupy'+k+':pub';
			});

			_.each(tags, function(e){
				this.subs = _.without(this.subs, e);
				this.leave(e.toLowerCase());
				index.zincrby('syndicate', -1, e, function(err,r){
					console.log(r);
					if (r == 0){	
						console.log('unsubbin');
						client.unsubscribe(e);
					}
				})
			},this)
		}

	});
	client.on('subscribe', function(channel, count){
		console.log('sub', channel, count)
	});
	client.on('unsubscribe', function(channel, count){
		console.log('unsub', channel, count)
	})
	client.on('message', function (channel, message) {
		console.log(channel, message.slice(0,100))
//			socket.emit('news', message);
		io.sockets.in(channel).emit('news', message)
//		socket.broadcast.to(channel).emit('news', message) // can add channel to the emittance
	});
	
});


//console.log("Express server listening on port %d", app.address().port);
