
/**
 * Module dependencies.
 */

var express = require('express')
,		redis = require('redis')
,		client = redis.createClient()
, 	RedisStore = require('connect-redis')(express)
,	  trackmap = require('../../makeData.js')
,		_ = require('underscore');

var app = module.exports = express.createServer();
app.listen(8008);
var	io = require('socket.io').listen(app);

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
	Object.keys(socket).forEach(function(e){
		consnole.log(socket[e])
	});
	socket.on('subscribe', function(data){
		var tags = _.map(trackmap.mapTags(data), function(k){
			return 'occupy'+k+':pub';
		});
		console.log(tags)
		tags.forEach(function(e){
			socket.join(e);
			client.subscribe(e, redis.print)
		})
	});

	socket.on('unsubscribe', function(data){

		var tags = _.map(trackmap.mapTags(data.toString()), function(k){
			return 'occupy'+k+':pub';
		});
		console.log(tags)
		tags.forEach(function(e){
			socket.leave(e);
			client.unsubscribe(e, redis.print)})
	});
	
	client.on('message', function (channel, message) {
			socket.broadcast.to(channel).emit(message) // can add channel to the emittance
	});
	
});


console.log("Express server listening on port %d", app.address().port);
