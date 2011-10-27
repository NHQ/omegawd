
/**
 * Module dependencies.
 */

var express = require('express')
,		redis = require('redis')
,		client = redis.createClient()
, 	RedisStore = require('connect-redis')(express)
,	  trackmap = require('../../makeData.js');

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
		states: trackMap.states
  });
});

io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
	client.subscribe('occupyoakland:pub')
	client.on("message", function (channel, message) {
			socket.emit('news', message)
	});
});


console.log("Express server listening on port %d", app.address().port);
