
/**
 * Module dependencies.
 */

var express = require('express')
,		redis = require('redis')
, 	RedisStore = require('connect-redis')(express)
,	  trackmap = require('../../makeData.js')
,		_ = require('underscore')
,		client = redis.createClient();

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

io.sockets.on('connection', function (socket) {
	socket.synd = redis.createClient();
	socket.subs = [];
//	console.log(socket);
	
	socket.on('disconnect', function(){
		socket.synd.unsubscribe();
	})
	
	socket.on('subscribe', function(data){
		if(data.toLowerCase() == 'occupy'){
			
			tags = ['occupy:pub', 'ows:pub', '99percent:pub', 'occupywallst:pub', 'occupywallstreet:pub'];
	
			tags.forEach(function(e){
				socket.join(e.toLowerCase());
				client.zincrby('syndicate', 1, e, function(err,r){
					console.log(err,r);
					if (r == 1)
					client.subscribe(e.toLowerCase())
				})
			})
		}
		
		else {
			
			var tags = _.map(trackmap.mapTags(data), function(k){
				return 'occupy'+k+':pub';
			});	
			
			_.each(tags, function(e){
				this.subs.push[e];
				this.join(e.toLowerCase());
				client.zincrby('syndicate', 1, e, function(err,r){
					if (r === 1){	
						client.subscribe(e)
					}
				})
			},this)
		}
	});

	socket.on('unsubscribe', function(data){
		console.log(data);
		if(data.toLowerCase() == 'occupy'){
		
			tags = ['occupy:pub', 'ows:pub', '99percent:pub', 'occupywallst:pub', 'occupywallstreet:pub']
		
			tags.forEach(function(e){
				socket.leave(e.toLowerCase());
				client.zincrby('syndicate', -1, e, function(err,r){
					console.log(err,r);
					if (r == 0)
					client.unsubscribe(e.toLowerCase())
				})
			})
		}
		
		else {
			
			var tags = _.map(trackmap.mapTags(data), function(k){
				return 'occupy'+k+':pub';
			});

			tags.forEach(function(e){
				socket.leave(e.toLowerCase());
				client.zincrby('syndicate', -1, e, function(err,r){
					console.log(err,r);
					if (r == 0)
					client.unsubscribe(e.toLowerCase())			
				})
			})
		}

	});
	client.on('subscribe', function(channel, count){
		console.log(channel, count)
	});
	client.on('unsubscribe', function(channel, count){
		console.log(channel, count)
	})
	client.on('message', function (channel, message) {
//			socket.emit('news', message);
		io.sockets.in(channel).emit('news', message)
//		socket.broadcast.to(channel).emit('news', message) // can add channel to the emittance
	});
	
});


console.log("Express server listening on port %d", app.address().port);
